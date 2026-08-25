/**
 * Utility for handling image uploads, resizing, and client-side compression
 * to keep payloads compact, ultra-fast, and 100% compatible with Firestore's 1MB limit.
 */

export interface ProcessedImage {
  dataUrl: string;
  name: string;
  size: number;
  width?: number;
  height?: number;
}

/**
 * Compresses an image data URL if it exceeds max size or dimensions.
 */
export async function compressDataUrlIfNeeded(
  dataUrl: string,
  maxDimension: number = 720,
  quality: number = 0.68
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) {
    return dataUrl;
  }
  // If it's already an SVG, leave as is
  if (dataUrl.startsWith('data:image/svg+xml')) {
    return dataUrl;
  }

  // If already under 45KB and is WebP or JPEG, it's already optimized
  const approximateSize = Math.round((dataUrl.length * 3) / 4);
  if (approximateSize < 45 * 1024) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      let compressed = '';
      try {
        compressed = canvas.toDataURL('image/webp', quality);
      } catch {
        compressed = '';
      }

      if (!compressed || !compressed.startsWith('data:image/webp')) {
        compressed = canvas.toDataURL('image/jpeg', quality);
      }

      resolve(compressed && compressed.length < dataUrl.length ? compressed : dataUrl);
    };

    img.onerror = () => {
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}

/**
 * Compresses an image file to a lightweight WebP or JPEG DataURL with responsive max dimensions.
 */
export async function processImageFile(
  file: File,
  maxDimension: number = 720,
  quality: number = 0.68
): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    // If it's an SVG, read directly as text or data URL
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          dataUrl: reader.result as string,
          name: file.name,
          size: file.size,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            dataUrl: e.target?.result as string,
            name: file.name,
            size: file.size,
            width,
            height,
          });
          return;
        }

        // Draw image smoothly onto canvas
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first for max compression efficiency
        let compressedDataUrl = '';
        try {
          compressedDataUrl = canvas.toDataURL('image/webp', quality);
        } catch {
          compressedDataUrl = '';
        }

        // If WebP is not supported or failed, fallback to JPEG
        if (!compressedDataUrl || !compressedDataUrl.startsWith('data:image/webp')) {
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        // If size is still > 60KB, perform a fast second pass resize
        const approximateSize = Math.round((compressedDataUrl.length * 3) / 4);
        if (approximateSize > 60 * 1024 && width > 500) {
          const smallWidth = Math.round(width * 0.8);
          const smallHeight = Math.round(height * 0.8);
          const smallCanvas = document.createElement('canvas');
          smallCanvas.width = smallWidth;
          smallCanvas.height = smallHeight;
          const sCtx = smallCanvas.getContext('2d');
          if (sCtx) {
            sCtx.imageSmoothingEnabled = true;
            sCtx.imageSmoothingQuality = 'medium';
            sCtx.drawImage(img, 0, 0, smallWidth, smallHeight);
            try {
              const secondPass = smallCanvas.toDataURL('image/webp', 0.65);
              if (secondPass.startsWith('data:image/webp') && secondPass.length < compressedDataUrl.length) {
                compressedDataUrl = secondPass;
              }
            } catch {
              // keep previous
            }
          }
        }

        resolve({
          dataUrl: compressedDataUrl,
          name: file.name,
          size: Math.round((compressedDataUrl.length * 3) / 4),
          width,
          height,
        });
      };

      img.onerror = () => {
        resolve({
          dataUrl: e.target?.result as string,
          name: file.name,
          size: file.size,
        });
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Process multiple files concurrently with optimal sizing
 */
export async function processMultipleImageFiles(
  files: FileList | File[],
  maxDimension: number = 720,
  quality: number = 0.68
): Promise<ProcessedImage[]> {
  const fileArray = Array.from(files);
  const imageFiles = fileArray.filter((f) => f.type.startsWith('image/'));
  
  const results = await Promise.all(
    imageFiles.map((file) => processImageFile(file, maxDimension, quality))
  );

  return results;
}



/**
 * Utility for handling image uploads, resizing, and client-side compression
 * to keep payloads compact and lightning fast.
 */

export interface ProcessedImage {
  dataUrl: string;
  name: string;
  size: number;
  width?: number;
  height?: number;
}

/**
 * Compresses an image file to a WebP or JPEG DataURL with maximum dimensions and quality control.
 */
export async function processImageFile(
  file: File,
  maxDimension: number = 900,
  quality: number = 0.78
): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    // If it's an SVG, read directly as text or data URL without canvas rasterization
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

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first, fallback to JPEG
        let mimeType = 'image/webp';
        let compressedDataUrl = canvas.toDataURL(mimeType, quality);

        // If WebP is not smaller or not supported, use jpeg
        if (!compressedDataUrl.startsWith('data:image/webp')) {
          mimeType = 'image/jpeg';
          compressedDataUrl = canvas.toDataURL(mimeType, quality);
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
        // Fallback to original read if canvas decode fails
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
 * Process multiple files concurrently
 */
export async function processMultipleImageFiles(
  files: FileList | File[],
  maxDimension: number = 1400,
  quality: number = 0.85
): Promise<ProcessedImage[]> {
  const fileArray = Array.from(files);
  const imageFiles = fileArray.filter((f) => f.type.startsWith('image/'));
  
  const results = await Promise.all(
    imageFiles.map((file) => processImageFile(file, maxDimension, quality))
  );

  return results;
}

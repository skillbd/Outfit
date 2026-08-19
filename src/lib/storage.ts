import { getStorage, ref, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage';
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../../firebase-applet-config.json';
import { processImageFile } from '../utils/imageUtils';

// Initialize Firebase App & Storage
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app, firebaseConfig.storageBucket);

/**
 * Uploads a file to Firebase Storage.
 * If Firebase Storage is temporarily restricted or offline, falls back to an optimized WebP Base64 string.
 */
export async function uploadToStorage(
  file: File,
  folder: 'products' | 'hero' | 'branding' = 'products'
): Promise<string> {
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
  const path = `${folder}/${timestamp}_${sanitizedName}`;
  const storageRef = ref(storage, path);

  try {
    // Attempt standard Firebase Storage upload
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type || 'image/jpeg',
    });
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (storageError) {
    console.warn('Firebase Storage upload warning, attempting base64 fallback:', storageError);
    // Fallback: compress client-side to clean WebP/JPEG DataURL
    try {
      const fallbackProcessed = await processImageFile(file);
      return fallbackProcessed.dataUrl;
    } catch (fallbackError) {
      console.error('Image processing fallback error:', fallbackError);
      throw new Error('Failed to process and upload image.');
    }
  }
}

/**
 * Uploads a base64 DataURL or raw string to Firebase Storage
 */
export async function uploadDataUrlToStorage(
  dataUrl: string,
  folder: 'products' | 'hero' | 'branding' = 'products',
  fileName: string = 'image.webp'
): Promise<string> {
  if (!dataUrl.startsWith('data:')) {
    // Already a remote URL
    return dataUrl;
  }

  const timestamp = Date.now();
  const path = `${folder}/${timestamp}_${fileName}`;
  const storageRef = ref(storage, path);

  try {
    const snapshot = await uploadString(storageRef, dataUrl, 'data_url');
    return await getDownloadURL(snapshot.ref);
  } catch (err) {
    console.warn('DataURL storage upload fallback to original dataUrl:', err);
    return dataUrl;
  }
}

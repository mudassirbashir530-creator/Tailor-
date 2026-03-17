import { useState, useCallback } from 'react';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { storage } from '@/firebase/config';
import { v4 as uuidv4 } from 'uuid';

export function useStorage() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadImage = useCallback(async (
    file: File,
    folder: string,
    shopId: string
  ): Promise<string> => {
    setUploading(true);
    setProgress(0);

    try {
      const fileExtension = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const storageRef = ref(storage, `${folder}/${shopId}/${fileName}`);

      // Simulate progress since uploadBytes doesn't have progress callback
      setProgress(30);
      await uploadBytes(storageRef, file);
      setProgress(70);

      const downloadURL = await getDownloadURL(storageRef);
      setProgress(100);

      return downloadURL;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  }, []);

  const deleteImage = useCallback(async (imageUrl: string): Promise<void> => {
    try {
      // Extract the path from the URL
      const url = new URL(imageUrl);
      const pathMatch = url.pathname.match(/\/o\/(.+?)\?/);
      if (pathMatch) {
        const path = decodeURIComponent(pathMatch[1]);
        const imageRef = ref(storage, path);
        await deleteObject(imageRef);
      }
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }, []);

  return {
    uploadImage,
    deleteImage,
    uploading,
    progress
  };
}

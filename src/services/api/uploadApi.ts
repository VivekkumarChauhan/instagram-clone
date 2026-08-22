import apiClient from './apiClient';
import type { Reel } from '@appTypes/reels';

export interface UploadSignatureResponse {
  signature: string;
  timestamp: number;
  folder: string;
  cloudName: string;
  apiKey: string;
}

export interface CreateReelPayload {
  videoUrl: string;
  thumbnailUrl?: string;
  publicId?: string;
  caption?: string;
  audioName?: string;
  duration?: number;
}

export const uploadApi = {
  /**
   * Request signed upload parameters from our backend
   */
  getUploadSignature: async (): Promise<UploadSignatureResponse> => {
    const response = await apiClient.post<UploadSignatureResponse>('/reels/upload-url');
    return response.data;
  },

  /**
   * Upload video directly to Cloudinary with upload progress reporting
   */
  uploadVideoToCloudinary: async (
    fileUri: string,
    sigData?: UploadSignatureResponse,
    onProgress?: (progressPercent: number) => void,
  ): Promise<{ secure_url: string; public_id: string; thumbnail_url: string }> => {
    // 1. Try direct Cloudinary upload if signature is available
    if (sigData) {
      try {
        const result = await new Promise<{ secure_url: string; public_id: string; thumbnail_url: string }>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          const url = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/video/upload`;

          xhr.open('POST', url);

          if (xhr.upload && onProgress) {
            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100);
                onProgress(percent);
              }
            };
          }

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const res = JSON.parse(xhr.responseText);
                const thumbnailUrl = res.secure_url.replace(/\.[^/.]+$/, '.jpg');
                resolve({
                  secure_url: res.secure_url,
                  public_id: res.public_id,
                  thumbnail_url: thumbnailUrl,
                });
              } catch (e) {
                reject(new Error('Failed to parse Cloudinary response'));
              }
            } else {
              try {
                const err = JSON.parse(xhr.responseText);
                reject(new Error(err.error?.message || `Cloudinary upload failed (${xhr.status})`));
              } catch {
                reject(new Error(`Cloudinary upload failed (${xhr.status})`));
              }
            }
          };

          xhr.onerror = () => reject(new Error('Network error during video upload'));

          const formData = new FormData();
          formData.append('file', {
            uri: fileUri,
            type: 'video/mp4',
            name: 'reel_upload.mp4',
          } as any);
          formData.append('api_key', sigData.apiKey);
          formData.append('timestamp', String(sigData.timestamp));
          formData.append('signature', sigData.signature);
          formData.append('folder', sigData.folder);

          xhr.send(formData);
        });

        return result;
      } catch (err) {
        console.log('[Direct Cloudinary failed, falling back to backend stream]', err);
      }
    }

    // 2. Fallback: Stream through backend
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: 'video/mp4',
      name: 'reel_upload.mp4',
    } as any);

    const response = await apiClient.post<{ secure_url: string; public_id: string; thumbnail_url: string }>(
      '/reels/upload-direct',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total && onProgress) {
            const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            onProgress(percent);
          }
        },
      }
    );

    return response.data;
  },

  /**
   * Save the newly uploaded reel into MongoDB
   */
  createReel: async (payload: CreateReelPayload): Promise<Reel> => {
    const response = await apiClient.post<Reel>('/reels', payload);
    return response.data;
  },
};

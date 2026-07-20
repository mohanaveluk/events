import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { APP_CONFIG } from '../configs/app.config.constants';

export interface UploadResult {
  imageUrl: string;
  thumbnailUrl: string;
}

export interface FileValidation {
  valid: boolean;
  reason?: string;
}

/**
 * Mock image-upload service. Validates files, produces local object-URL previews
 * and simulates a progressive upload. Replace `simulateUpload` with a real
 * multipart HTTP request (report progress via HttpClient `reportProgress`).
 */
@Injectable({ providedIn: 'root' })
export class ImageUploadService {
  validate(file: File): FileValidation {
    const { acceptedImageTypes, maxUploadSizeMb } = APP_CONFIG.gallery;
    if (!(acceptedImageTypes as readonly string[]).includes(file.type)) {
      return { valid: false, reason: `${file.name}: unsupported format` };
    }
    if (file.size > maxUploadSizeMb * 1024 * 1024) {
      return { valid: false, reason: `${file.name}: exceeds ${maxUploadSizeMb}MB` };
    }
    return { valid: true };
  }

  /** Create a revocable local preview URL for a selected file. */
  createPreview(file: File): string {
    return URL.createObjectURL(file);
  }

  revokePreview(url: string): void {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Simulate an upload, emitting progress 0..100. Emits the final URLs on the
   * `result` of the last value via `complete`. The caller subscribes for progress.
   */
  simulateUpload(file: File): Observable<{ progress: number; result?: UploadResult }> {
    return new Observable((subscriber) => {
      let progress = 0;
      const previewUrl = this.createPreview(file);
      const step = 8 + Math.floor(file.size % 7); // vary per file
      const timer = setInterval(() => {
        progress = Math.min(100, progress + step);
        if (progress >= 100) {
          clearInterval(timer);
          subscriber.next({
            progress: 100,
            result: { imageUrl: previewUrl, thumbnailUrl: previewUrl },
          });
          subscriber.complete();
        } else {
          subscriber.next({ progress });
        }
      }, 140);

      return () => clearInterval(timer);
    });
  }
}

import { computed, Injectable, signal } from '@angular/core';

export interface LightboxImage {
  src: string;
  thumb?: string;
  caption?: string;
}

/**
 * Global lightbox controller. Any component can open the shared lightbox with a
 * set of images and a starting index; the <app-lightbox> host (mounted once in
 * the main layout) renders based on this state.
 */
@Injectable({ providedIn: 'root' })
export class GalleryService {
  private readonly _images = signal<LightboxImage[]>([]);
  private readonly _index = signal(0);
  private readonly _open = signal(false);

  readonly images = this._images.asReadonly();
  readonly index = this._index.asReadonly();
  readonly isOpen = this._open.asReadonly();
  readonly current = computed(() => this._images()[this._index()]);
  readonly count = computed(() => this._images().length);

  open(images: LightboxImage[], startIndex = 0): void {
    if (!images.length) return;
    this._images.set(images);
    this._index.set(Math.max(0, Math.min(startIndex, images.length - 1)));
    this._open.set(true);
  }

  close(): void {
    this._open.set(false);
  }

  next(): void {
    this._index.update((i) => (i + 1) % this._images().length);
  }

  prev(): void {
    this._index.update((i) => (i - 1 + this._images().length) % this._images().length);
  }

  goTo(i: number): void {
    if (i >= 0 && i < this._images().length) {
      this._index.set(i);
    }
  }
}

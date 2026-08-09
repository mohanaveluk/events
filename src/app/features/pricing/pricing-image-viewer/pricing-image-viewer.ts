import { ChangeDetectionStrategy, Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { PricingViewerData } from '../../../core/models/pricing.model';

/**
 * Full-screen pricing image viewer, opened as an Angular Material dialog.
 *
 * Receives one design's complete image collection via MAT_DIALOG_DATA
 * (`{ images, selectedIndex, designName }`). Shows the ORIGINAL image with zoom
 * in/out, previous/next, fullscreen, close, a thumbnail strip (active thumb has a
 * gold border) and keyboard navigation. Navigation stays within this design only.
 *
 * Open it with:
 *   dialog.open(PricingImageViewerComponent, {
 *     data: { images, selectedIndex, designName },
 *     panelClass: 'pricing-viewer-panel', maxWidth: '100vw',
 *   });
 */
@Component({
  selector: 'app-pricing-image-viewer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pricing-image-viewer.html',
  styleUrl: './pricing-image-viewer.scss',
})
export class PricingImageViewerComponent {
  private readonly dialogRef = inject(MatDialogRef<PricingImageViewerComponent>);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly data = inject<PricingViewerData>(MAT_DIALOG_DATA);

  protected readonly index = signal(
    Math.max(0, Math.min(this.data.selectedIndex ?? 0, this.data.images.length - 1)),
  );
  protected readonly scale = signal(1);

  protected current() {
    return this.data.images[this.index()];
  }

  zoomIn(): void {
    this.scale.update((s) => Math.min(4, +(s + 0.5).toFixed(1)));
  }

  zoomOut(): void {
    this.scale.update((s) => Math.max(1, +(s - 0.5).toFixed(1)));
  }

  next(e?: Event): void {
    e?.stopPropagation();
    this.index.update((i) => (i + 1) % this.data.images.length);
    this.scale.set(1);
  }

  prev(e?: Event): void {
    e?.stopPropagation();
    this.index.update((i) => (i - 1 + this.data.images.length) % this.data.images.length);
    this.scale.set(1);
  }

  goTo(i: number): void {
    this.index.set(i);
    this.scale.set(1);
  }

  close(): void {
    this.dialogRef.close();
  }

  toggleFullscreen(): void {
    const el = this.host.nativeElement;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    switch (e.key) {
      case 'ArrowRight':
        this.next();
        break;
      case 'ArrowLeft':
        this.prev();
        break;
      case '+':
      case '=':
        this.zoomIn();
        break;
      case '-':
        this.zoomOut();
        break;
      // Escape is handled by MatDialog's default close behaviour.
    }
  }
}

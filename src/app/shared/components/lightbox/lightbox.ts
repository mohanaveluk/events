import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';

import { GalleryService } from '../../../core/services/gallery.service';

/**
 * Full-screen lightbox driven by GalleryService. Mounted once in the main layout.
 * Features: zoom in/out, next / previous, fullscreen, keyboard navigation,
 * thumbnail strip and click-outside to close.
 *
 * Built in-house instead of ngx-lightbox (unreliable on Angular 21).
 */
@Component({
  selector: 'app-lightbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (gallery.isOpen()) {
      <div class="lightbox fade-in" (click)="onBackdrop($event)">
        <div class="lightbox__toolbar">
          <span class="lightbox__counter">
            {{ gallery.index() + 1 }} / {{ gallery.count() }}
          </span>
          <div class="lightbox__actions">
            <button type="button" (click)="zoomOut()" aria-label="Zoom out" [disabled]="scale() <= 1">
              <span class="material-icons">zoom_out</span>
            </button>
            <button type="button" (click)="zoomIn()" aria-label="Zoom in" [disabled]="scale() >= 4">
              <span class="material-icons">zoom_in</span>
            </button>
            <button type="button" (click)="toggleFullscreen()" aria-label="Toggle fullscreen">
              <span class="material-icons">fullscreen</span>
            </button>
            <button type="button" (click)="gallery.close()" aria-label="Close">
              <span class="material-icons">close</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          class="lightbox__nav lightbox__nav--prev"
          (click)="prev($event)"
          aria-label="Previous"
        >
          <span class="material-icons">chevron_left</span>
        </button>

        <figure class="lightbox__stage">
          <img
            [src]="gallery.current().src"
            [alt]="gallery.current().caption || ''"
            [style.transform]="'scale(' + scale() + ')'"
            (click)="$event.stopPropagation()"
          />
          @if (gallery.current().caption) {
            <figcaption>{{ gallery.current().caption }}</figcaption>
          }
        </figure>

        <button
          type="button"
          class="lightbox__nav lightbox__nav--next"
          (click)="next($event)"
          aria-label="Next"
        >
          <span class="material-icons">chevron_right</span>
        </button>

        <div class="lightbox__thumbs" (click)="$event.stopPropagation()">
          @for (img of gallery.images(); track img.src; let i = $index) {
            <button
              type="button"
              class="lightbox__thumb"
              [class.is-active]="i === gallery.index()"
              (click)="gallery.goTo(i)"
            >
              <img [src]="img.thumb || img.src" alt="" loading="lazy" />
            </button>
          }
        </div>
      </div>
    }
  `,
  styleUrl: './lightbox.scss',
})
export class LightboxComponent {
  readonly gallery = inject(GalleryService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly scale = signal(1);

  constructor() {
    // Reset zoom whenever the active image changes or the lightbox reopens.
    effect(() => {
      this.gallery.index();
      this.gallery.isOpen();
      this.scale.set(1);
    });
  }

  zoomIn(): void {
    this.scale.update((s) => Math.min(4, +(s + 0.5).toFixed(1)));
  }

  zoomOut(): void {
    this.scale.update((s) => Math.max(1, +(s - 0.5).toFixed(1)));
  }

  next(e: Event): void {
    e.stopPropagation();
    this.gallery.next();
  }

  prev(e: Event): void {
    e.stopPropagation();
    this.gallery.prev();
  }

  onBackdrop(e: MouseEvent): void {
    if (e.target === e.currentTarget) {
      this.gallery.close();
    }
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
    if (!this.gallery.isOpen()) return;
    switch (e.key) {
      case 'Escape':
        this.gallery.close();
        break;
      case 'ArrowRight':
        this.gallery.next();
        break;
      case 'ArrowLeft':
        this.gallery.prev();
        break;
      case '+':
      case '=':
        this.zoomIn();
        break;
      case '-':
        this.zoomOut();
        break;
    }
  }
}

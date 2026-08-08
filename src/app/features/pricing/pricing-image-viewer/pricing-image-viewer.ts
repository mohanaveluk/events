import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

/**
 * Full-screen pricing image viewer. Opens the package's ORIGINAL images with
 * zoom in/out, previous/next, fullscreen and close. Controlled by the parent via
 * the `open`, `images` and `startIndex` inputs; emits `closed` on dismissal.
 */
@Component({
  selector: 'app-pricing-image-viewer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open() && images().length) {
      <div class="viewer fade-in" (click)="onBackdrop($event)">
        <div class="viewer__toolbar">
          <span class="viewer__counter">{{ index() + 1 }} / {{ images().length }}</span>
          <div class="viewer__actions">
            <button type="button" (click)="zoomOut()" aria-label="Zoom out" [disabled]="scale() <= 1">
              <span class="material-icons">zoom_out</span>
            </button>
            <button type="button" (click)="zoomIn()" aria-label="Zoom in" [disabled]="scale() >= 4">
              <span class="material-icons">zoom_in</span>
            </button>
            <button type="button" (click)="toggleFullscreen()" aria-label="Fullscreen">
              <span class="material-icons">fullscreen</span>
            </button>
            <button type="button" (click)="close()" aria-label="Close">
              <span class="material-icons">close</span>
            </button>
          </div>
        </div>

        @if (images().length > 1) {
          <button type="button" class="viewer__nav viewer__nav--prev" (click)="prev($event)" aria-label="Previous">
            <span class="material-icons">chevron_left</span>
          </button>
          <button type="button" class="viewer__nav viewer__nav--next" (click)="next($event)" aria-label="Next">
            <span class="material-icons">chevron_right</span>
          </button>
        }

        <figure class="viewer__stage">
          <img
            [src]="images()[index()]"
            alt=""
            [style.transform]="'scale(' + scale() + ')'"
            (click)="$event.stopPropagation()"
          />
        </figure>
      </div>
    }
  `,
  styles: [
    `
      .viewer {
        position: fixed;
        inset: 0;
        z-index: 1100;
        display: grid;
        grid-template-rows: auto 1fr;
        background: rgba(20, 16, 8, 0.95);
        backdrop-filter: blur(6px);
      }
      .viewer__toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 20px;
        color: #fff;
      }
      .viewer__counter {
        color: var(--brand-gold-light);
        letter-spacing: 1px;
      }
      .viewer__actions {
        display: flex;
        gap: 6px;
      }
      .viewer__actions button,
      .viewer__nav {
        border: none;
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        cursor: pointer;
        display: grid;
        place-items: center;
        transition: background 0.2s ease;
      }
      .viewer__actions button:hover,
      .viewer__nav:hover {
        background: var(--brand-gold);
      }
      .viewer__actions button:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }
      .viewer__nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
      }
      .viewer__nav--prev {
        left: 18px;
      }
      .viewer__nav--next {
        right: 18px;
      }
      .viewer__stage {
        margin: 0;
        display: grid;
        place-items: center;
        overflow: auto;
        padding: 12px;
      }
      .viewer__stage img {
        max-width: 92vw;
        max-height: 82vh;
        object-fit: contain;
        border-radius: 8px;
        transition: transform 0.25s ease;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      }
    `,
  ],
})
export class PricingImageViewerComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly images = input.required<string[]>();
  readonly open = input(false);
  readonly startIndex = input(0);
  readonly closed = output<void>();

  protected readonly index = signal(0);
  protected readonly scale = signal(1);

  constructor() {
    // Sync to the requested start image and reset zoom whenever the viewer opens.
    effect(() => {
      if (this.open()) {
        this.index.set(this.startIndex());
        this.scale.set(1);
      }
    });
  }

  zoomIn(): void {
    this.scale.update((s) => Math.min(4, +(s + 0.5).toFixed(1)));
  }

  zoomOut(): void {
    this.scale.update((s) => Math.max(1, +(s - 0.5).toFixed(1)));
  }

  next(e?: Event): void {
    e?.stopPropagation();
    this.index.update((i) => (i + 1) % this.images().length);
    this.scale.set(1);
  }

  prev(e?: Event): void {
    e?.stopPropagation();
    this.index.update((i) => (i - 1 + this.images().length) % this.images().length);
    this.scale.set(1);
  }

  close(): void {
    this.closed.emit();
  }

  onBackdrop(e: MouseEvent): void {
    if (e.target === e.currentTarget) this.close();
  }

  toggleFullscreen(): void {
    const el = this.host.nativeElement.querySelector('.viewer') as HTMLElement | null;
    if (!document.fullscreenElement) {
      el?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (!this.open()) return;
    switch (e.key) {
      case 'Escape':
        this.close();
        break;
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
    }
  }
}

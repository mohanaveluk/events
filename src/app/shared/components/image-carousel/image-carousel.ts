import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  OnDestroy,
  output,
  signal,
} from '@angular/core';

import { LazyImgDirective } from '../../directives/lazy-img.directive';
import { APP_CONFIG } from '../../../core/configs/app.config.constants';

/**
 * Lightweight signal-based image carousel.
 * - auto-advances every `intervalMs` (default 4s)
 * - pauses on hover / focus
 * - prev / next arrows + dot indicators
 * - emits `imageClick` with the active index
 *
 * Built in-house instead of ngx-swiper-wrapper (deprecated, no Angular 21 support).
 */
@Component({
  selector: 'app-image-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LazyImgDirective],
  template: `
    <div
      class="carousel"
      (pointerenter)="pause()"
      (pointerleave)="resume()"
      (focusin)="pause()"
      (focusout)="resume()"
    >
      <div class="carousel__track" [style.transform]="trackTransform()">
        @for (src of images(); track src; let i = $index) {
          <button
            type="button"
            class="carousel__slide"
            (click)="imageClick.emit(i)"
            [attr.aria-label]="'View photo ' + (i + 1)"
          >
            <img appLazyImg [lazySrc]="src" alt="" />
          </button>
        }
      </div>

      @if (images().length > 1) {
        <button
          type="button"
          class="carousel__nav carousel__nav--prev"
          (click)="prev()"
          aria-label="Previous photo"
        >
          <span class="material-icons">chevron_left</span>
        </button>
        <button
          type="button"
          class="carousel__nav carousel__nav--next"
          (click)="next()"
          aria-label="Next photo"
        >
          <span class="material-icons">chevron_right</span>
        </button>

        <div class="carousel__dots">
          @for (src of images(); track src; let i = $index) {
            <button
              type="button"
              class="carousel__dot"
              [class.is-active]="i === index()"
              (click)="goTo(i)"
              [attr.aria-label]="'Go to photo ' + (i + 1)"
            ></button>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .carousel {
        position: relative;
        overflow: hidden;
        width: 100%;
        height: 100%;
        border-radius: inherit;
      }
      .carousel__track {
        display: flex;
        height: 100%;
        transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .carousel__slide {
        flex: 0 0 100%;
        padding: 0;
        border: 0;
        background: #eee;
        cursor: zoom-in;
        height: 100%;
      }
      .carousel__slide img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 1;
        transition: opacity 0.5s ease, transform 0.6s ease;
      }
      .carousel__slide img.lazy-pending {
        opacity: 0;
      }
      .carousel:hover .carousel__slide img {
        transform: scale(1.04);
      }
      .carousel__nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 38px;
        height: 38px;
        border: none;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.9);
        color: var(--brand-ink);
        display: grid;
        place-items: center;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.25s ease, background 0.25s ease;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
      }
      .carousel:hover .carousel__nav {
        opacity: 1;
      }
      .carousel__nav:hover {
        background: var(--brand-gold);
        color: #fff;
      }
      .carousel__nav--prev {
        left: 10px;
      }
      .carousel__nav--next {
        right: 10px;
      }
      .carousel__dots {
        position: absolute;
        bottom: 10px;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        gap: 6px;
      }
      .carousel__dot {
        width: 7px;
        height: 7px;
        padding: 0;
        border: none;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.65);
        cursor: pointer;
        transition: all 0.25s ease;
      }
      .carousel__dot.is-active {
        width: 20px;
        border-radius: 999px;
        background: var(--brand-gold);
      }
    `,
  ],
})
export class ImageCarouselComponent implements OnDestroy {
  readonly images = input.required<string[]>();
  readonly intervalMs = input(APP_CONFIG.gallery.carouselIntervalMs);
  readonly autoPlay = input(true);
  readonly imageClick = output<number>();

  protected readonly index = signal(0);
  private paused = false;
  private timer?: ReturnType<typeof setInterval>;

  protected readonly trackTransform = computed(() => `translateX(-${this.index() * 100}%)`);

  constructor() {
    // Restart the autoplay timer whenever the source images or settings change.
    effect(() => {
      this.images();
      this.intervalMs();
      this.autoPlay();
      this.startTimer();
    });
  }

  private startTimer(): void {
    this.stopTimer();
    if (this.autoPlay() && this.images().length > 1) {
      this.timer = setInterval(() => {
        if (!this.paused) this.next();
      }, this.intervalMs());
    }
  }

  private stopTimer(): void {
    if (this.timer) clearInterval(this.timer);
  }

  next(): void {
    this.index.update((i) => (i + 1) % this.images().length);
  }

  prev(): void {
    this.index.update((i) => (i - 1 + this.images().length) % this.images().length);
  }

  goTo(i: number): void {
    this.index.set(i);
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }
}

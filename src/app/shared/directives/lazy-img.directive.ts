import {
  AfterViewInit,
  Directive,
  ElementRef,
  inject,
  input,
  OnDestroy,
  signal,
} from '@angular/core';

/**
 * Lazy-loads an image only when it scrolls into view (IntersectionObserver).
 * While pending / loading it exposes a `loaded` state consumers can bind to for
 * skeleton shimmer. Usage:
 *
 *   <img appLazyImg [lazySrc]="url" [class.is-loaded]="…" />
 *
 * The directive sets `src` when visible and adds the `lazy-loaded` class on load.
 */
@Directive({
  selector: 'img[appLazyImg]',
  host: {
    '[class.lazy-pending]': '!loaded()',
    '[class.lazy-loaded]': 'loaded()',
  },
})
export class LazyImgDirective implements AfterViewInit, OnDestroy {
  private readonly el = inject<ElementRef<HTMLImageElement>>(ElementRef);

  readonly lazySrc = input.required<string>();
  readonly loaded = signal(false);

  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    const img = this.el.nativeElement;
    const reveal = () => this.loaded.set(true);
    img.addEventListener('load', reveal);
    img.addEventListener('error', reveal);
    img.decoding = 'async';

    const load = () => {
      img.src = this.lazySrc();
      // Handle images that resolve synchronously (cached / inline SVG) where the
      // load event may not fire after the listener is attached.
      if (img.complete && img.naturalWidth > 0) {
        reveal();
      }
    };

    if (typeof IntersectionObserver === 'undefined') {
      load();
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            load();
            this.observer?.disconnect();
          }
        }
      },
      { rootMargin: '250px' },
    );
    this.observer.observe(img);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}

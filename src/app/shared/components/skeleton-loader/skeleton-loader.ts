import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Shimmer placeholder. `variant` controls the shape; `count` repeats it.
 */
@Component({
  selector: 'app-skeleton-loader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (i of items(); track i) {
      <span class="skeleton" [class]="'skeleton--' + variant()"></span>
    }
  `,
  styles: [
    `
      :host {
        display: contents;
      }
      .skeleton {
        display: block;
        border-radius: 12px;
        background: linear-gradient(
          100deg,
          #eeeae0 30%,
          #f7f3ea 50%,
          #eeeae0 70%
        );
        background-size: 200% 100%;
        animation: shimmer 1.3s ease-in-out infinite;
      }
      .skeleton--card {
        aspect-ratio: 4 / 3;
        width: 100%;
      }
      .skeleton--thumb {
        aspect-ratio: 1 / 1;
        width: 100%;
      }
      .skeleton--line {
        height: 14px;
        width: 100%;
        margin-bottom: 8px;
      }
      .skeleton--text {
        height: 12px;
        width: 60%;
      }
      @keyframes shimmer {
        from {
          background-position: 200% 0;
        }
        to {
          background-position: -200% 0;
        }
      }
    `,
  ],
})
export class SkeletonLoaderComponent {
  readonly variant = input<'card' | 'thumb' | 'line' | 'text'>('card');
  readonly count = input(1);

  protected items() {
    return Array.from({ length: this.count() }, (_, i) => i);
  }
}

import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';

import { EventPhoto } from '../../../core/models/event.model';
import { GalleryService } from '../../../core/services/gallery.service';
import { LazyImgDirective } from '../../directives/lazy-img.directive';

/**
 * Pinterest-style masonry gallery using CSS columns. Images lazy-load and open
 * the shared lightbox on click.
 */
@Component({
  selector: 'app-masonry-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LazyImgDirective],
  template: `
    <div class="masonry">
      @for (photo of photos(); track photo.id; let i = $index) {
        <button
          type="button"
          class="masonry__item"
          (click)="open(i)"
          [attr.aria-label]="photo.caption || 'View photo ' + (i + 1)"
        >
          <img appLazyImg [lazySrc]="photo.thumbnailUrl" [alt]="photo.caption || ''" />
          <span class="masonry__zoom">
            <span class="material-icons">zoom_in</span>
          </span>
          @if (photo.caption) {
            <span class="masonry__caption">{{ photo.caption }}</span>
          }
        </button>
      }
    </div>
  `,
  styles: [
    `
      .masonry {
        column-gap: 16px;
        columns: 4 240px;
      }
      @media (max-width: 900px) {
        .masonry {
          columns: 3 180px;
        }
      }
      @media (max-width: 600px) {
        .masonry {
          columns: 2 140px;
          column-gap: 10px;
        }
      }
      .masonry__item {
        position: relative;
        display: block;
        width: 100%;
        margin: 0 0 16px;
        padding: 0;
        border: none;
        border-radius: 14px;
        overflow: hidden;
        cursor: zoom-in;
        break-inside: avoid;
        background: var(--brand-secondary);
        box-shadow: var(--brand-shadow);
      }
      .masonry__item img {
        width: 100%;
        height: auto;
        min-height: 120px;
        display: block;
        opacity: 1;
        transform: scale(1);
        transition: opacity 0.5s ease, transform 0.5s ease;
      }
      .masonry__item img.lazy-pending {
        opacity: 0;
      }
      .masonry__item:hover img {
        transform: scale(1.06);
      }
      .masonry__zoom {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        color: #fff;
        background: rgba(44, 36, 22, 0.28);
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .masonry__zoom .material-icons {
        font-size: 34px;
      }
      .masonry__item:hover .masonry__zoom {
        opacity: 1;
      }
      .masonry__caption {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 20px 12px 10px;
        font-size: 0.82rem;
        color: #fff;
        text-align: left;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .masonry__item:hover .masonry__caption {
        opacity: 1;
      }
    `,
  ],
})
export class MasonryGridComponent {
  private readonly gallery = inject(GalleryService);

  readonly photos = input.required<EventPhoto[]>();

  open(index: number): void {
    this.gallery.open(
      this.photos().map((p) => ({ src: p.imageUrl, thumb: p.thumbnailUrl, caption: p.caption })),
      index,
    );
  }
}

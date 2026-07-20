import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Event } from '../../../core/models/event.model';
import { GalleryService } from '../../../core/services/gallery.service';
import { ImageCarouselComponent } from '../image-carousel/image-carousel';
import { DayjsDatePipe } from '../../pipes/dayjs-date.pipe';

/**
 * Portfolio card: image carousel on top, event meta below. Clicking a carousel
 * image opens the shared lightbox; the title links to the event detail page.
 */
@Component({
  selector: 'app-event-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ImageCarouselComponent, DayjsDatePipe],
  template: `
    <article class="card slide-up">
      <div class="card__media">
        @if (carouselImages().length) {
          <app-image-carousel
            [images]="carouselImages()"
            (imageClick)="openLightbox($event)"
          />
        } @else {
          <img class="card__fallback" [src]="event().coverImage" alt="" />
        }
        <span class="card__badge">
          <span class="material-icons">photo_library</span>
          {{ event().totalPhotos }}
        </span>
      </div>

      <div class="card__body">
        <span class="card__category">{{ event().category }}</span>
        <h3 class="card__title">
          <a [routerLink]="['/event', event().id]">{{ event().title }}</a>
        </h3>
        <p class="card__meta">
          <span class="material-icons">event</span>
          {{ event().eventDate | dayjsDate }}
        </p>
        <p class="card__meta">
          <span class="material-icons">place</span>
          {{ event().location }}
        </p>
        <a class="card__cta" [routerLink]="['/event', event().id]">
          View Gallery <span aria-hidden="true">→</span>
        </a>
      </div>
    </article>
  `,
  styleUrl: './event-card.scss',
})
export class EventCardComponent {
  private readonly gallery = inject(GalleryService);

  readonly event = input.required<Event>();
  /** Max photos to load into the card carousel. */
  readonly maxCarousel = input(6);

  protected readonly carouselImages = computed(() => {
    const photos = this.event().photos;
    if (photos.length) {
      return photos.slice(0, this.maxCarousel()).map((p) => p.thumbnailUrl);
    }
    return this.event().coverImage ? [this.event().coverImage] : [];
  });

  openLightbox(index: number): void {
    const photos = this.event().photos;
    if (!photos.length) return;
    this.gallery.open(
      photos.map((p) => ({ src: p.imageUrl, thumb: p.thumbnailUrl, caption: p.caption })),
      index,
    );
  }
}

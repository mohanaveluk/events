import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CategoryService } from '../../../core/services/category.service';
import { EventService } from '../../../core/services/event.service';
import { MasonryGridComponent } from '../../../shared/components/masonry-grid/masonry-grid';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { DayjsDatePipe } from '../../../shared/pipes/dayjs-date.pipe';

/**
 * Category landing page — e.g. /arangetram → "All Arangetram Decorations".
 * Each event renders as its own titled section with a responsive photo grid;
 * clicking a photo opens the shared lightbox.
 */
@Component({
  selector: 'app-event-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MasonryGridComponent, EmptyStateComponent, DayjsDatePipe],
  templateUrl: './event-list.html',
  styleUrl: './event-list.scss',
})
export class EventListComponent {
  private readonly categoryService = inject(CategoryService);
  private readonly eventService = inject(EventService);

  /** Bound from the `:categorySlug` route param. */
  readonly categorySlug = input.required<string>();

  protected readonly category = computed(() => this.categoryService.getBySlug(this.categorySlug()));

  protected readonly events = computed(() => {
    const info = this.category();
    return info ? this.eventService.getByCategory(info.key) : [];
  });

  protected readonly totalPhotos = computed(() =>
    this.events().reduce((sum, e) => sum + e.totalPhotos, 0),
  );
}

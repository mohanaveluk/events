import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { CategoryService } from '../../core/services/category.service';
import { EventService } from '../../core/services/event.service';
import { EventPhoto } from '../../core/models/event.model';
import { MasonryGridComponent } from '../../shared/components/masonry-grid/masonry-grid';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state';

/**
 * Full portfolio gallery — every photo across all events in a Pinterest-style
 * masonry, filterable by category.
 */
@Component({
  selector: 'app-gallery',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MasonryGridComponent, EmptyStateComponent],
  templateUrl: './gallery.html',
  styleUrl: './gallery.scss',
})
export class GalleryComponent {
  private readonly categoryService = inject(CategoryService);
  private readonly eventService = inject(EventService);

  protected readonly categories = this.categoryService.categories;
  protected readonly activeKey = signal<string>('all');

  protected readonly photos = computed<EventPhoto[]>(() => {
    const key = this.activeKey();
    return this.eventService
      .events()
      .filter((e) => key === 'all' || e.category === key)
      .flatMap((e) => e.photos);
  });

  setFilter(key: string): void {
    this.activeKey.set(key);
  }
}

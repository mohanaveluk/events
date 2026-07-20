import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { EventService } from '../../../core/services/event.service';
import { slugForCategory } from '../../../core/constants/categories.constant';
import { MasonryGridComponent } from '../../../shared/components/masonry-grid/masonry-grid';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';
import { DayjsDatePipe } from '../../../shared/pipes/dayjs-date.pipe';

/**
 * Single event page (/event/:id): banner cover, meta, description and the full
 * masonry gallery for that event.
 */
@Component({
  selector: 'app-event-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MasonryGridComponent, EmptyStateComponent, DayjsDatePipe],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.scss',
})
export class EventDetailComponent {
  private readonly eventService = inject(EventService);

  /** Bound from the `:id` route param. */
  readonly id = input.required<string>();

  protected readonly event = computed(() => this.eventService.getById(this.id()));
  protected readonly categorySlug = computed(() => {
    const e = this.event();
    return e ? slugForCategory(e.category) : '';
  });
}

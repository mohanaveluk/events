import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { EventService } from '../../../core/services/event.service';
import { CategoryService } from '../../../core/services/category.service';
import { DayjsDatePipe } from '../../../shared/pipes/dayjs-date.pipe';

@Component({
  selector: 'app-admin-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DayjsDatePipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent {
  private readonly eventService = inject(EventService);
  private readonly categoryService = inject(CategoryService);

  protected readonly events = this.eventService.events;

  protected readonly cards = computed(() => {
    const events = this.events();
    const photos = events.reduce((s, e) => s + e.totalPhotos, 0);
    return [
      { label: 'Total Events', value: events.length, icon: 'event', tone: 'gold' },
      { label: 'Total Photos', value: photos, icon: 'photo_library', tone: 'blue' },
      { label: 'Featured', value: events.filter((e) => e.isFeatured).length, icon: 'star', tone: 'green' },
      { label: 'Categories', value: this.categoryService.categories.length, icon: 'category', tone: 'purple' },
    ];
  });

  protected readonly recent = computed(() =>
    [...this.events()]
      .sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime())
      .slice(0, 6),
  );

  protected readonly byCategory = computed(() => {
    const events = this.events();
    return this.categoryService.categories.map((c) => ({
      label: c.label,
      count: events.filter((e) => e.category === c.key).length,
    }));
  });
}

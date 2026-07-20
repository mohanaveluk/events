import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { APP_CONFIG } from '../../core/configs/app.config.constants';
import { CategoryService } from '../../core/services/category.service';
import { EventService } from '../../core/services/event.service';
import { CategoryInfo, Event } from '../../core/models/event.model';
import { EventCardComponent } from '../../shared/components/event-card/event-card';
import { SectionHeaderComponent } from '../../shared/components/section-header/section-header';

interface HomeSection {
  info: CategoryInfo;
  events: Event[];
}

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, EventCardComponent, SectionHeaderComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {
  private readonly categoryService = inject(CategoryService);
  private readonly eventService = inject(EventService);

  protected readonly app = APP_CONFIG;
  protected readonly featured = this.eventService.featured;

  /** One section per category, each capped at N cards for the home page. */
  protected readonly sections = computed<HomeSection[]>(() => {
    const perSection = this.app.gallery.homeCardsPerSection;
    return this.categoryService.categories
      .map((info) => ({
        info,
        events: this.eventService.getByCategory(info.key).slice(0, perSection),
      }))
      .filter((s) => s.events.length > 0);
  });

  protected readonly stats = computed(() => {
    const events = this.eventService.events();
    const photos = events.reduce((sum, e) => sum + e.totalPhotos, 0);
    return [
      { value: `${events.length}+`, label: 'Events Styled' },
      { value: `${photos}+`, label: 'Photos Captured' },
      { value: `${this.categoryService.categories.length}`, label: 'Specialities' },
      { value: '10+', label: 'Years of Joy' },
    ];
  });
}

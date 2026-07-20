import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ToastrService } from 'ngx-toastr';

import { EventService } from '../../../core/services/event.service';
import { Event } from '../../../core/models/event.model';
import { DayjsDatePipe } from '../../../shared/pipes/dayjs-date.pipe';

@Component({
  selector: 'app-event-management',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    DayjsDatePipe,
  ],
  templateUrl: './event-management.html',
  styleUrl: './event-management.scss',
})
export class EventManagementComponent {
  private readonly eventService = inject(EventService);
  private readonly toastr = inject(ToastrService);

  protected readonly search = signal('');
  protected readonly pendingDelete = signal<Event | null>(null);

  protected readonly columns = ['title', 'category', 'location', 'date', 'photos', 'actions'];

  protected readonly events = computed(() => {
    const term = this.search().trim().toLowerCase();
    const all = this.eventService.events();
    if (!term) return all;
    return all.filter(
      (e) =>
        e.title.toLowerCase().includes(term) ||
        e.category.toString().toLowerCase().includes(term) ||
        e.location.toLowerCase().includes(term),
    );
  });

  onSearch(value: string): void {
    this.search.set(value);
  }

  askDelete(event: Event): void {
    this.pendingDelete.set(event);
  }

  cancelDelete(): void {
    this.pendingDelete.set(null);
  }

  confirmDelete(): void {
    const event = this.pendingDelete();
    if (!event) return;
    this.eventService.delete(event.id);
    this.pendingDelete.set(null);
    this.toastr.success(`“${event.title}” deleted.`);
  }
}

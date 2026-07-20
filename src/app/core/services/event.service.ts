import { computed, Injectable, signal } from '@angular/core';
import { v4 as uuid } from 'uuid';

import { Event, EventCategory, EventFormValue, EventPhoto } from '../models/event.model';
import { buildSeedEvents } from '../constants/seed-data';

/**
 * In-memory event store backed by Angular signals. Acts as a mock API — swap the
 * signal mutations for HTTP calls to wire a real backend without touching the UI.
 */
@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly _events = signal<Event[]>(buildSeedEvents());

  /** Read-only view of all events. */
  readonly events = this._events.asReadonly();

  /** Events flagged as featured, newest first. */
  readonly featured = computed(() =>
    this._events()
      .filter((e) => e.isFeatured)
      .sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime()),
  );

  getById(id: string): Event | undefined {
    return this._events().find((e) => e.id === id);
  }

  /** Reactive selector for a single event. */
  selectById(id: string) {
    return computed(() => this._events().find((e) => e.id === id));
  }

  /** Reactive selector for all events in a category, newest first. */
  selectByCategory(category: EventCategory | string) {
    return computed(() =>
      this._events()
        .filter((e) => e.category === category)
        .sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime()),
    );
  }

  /** Non-reactive category fetch (for guards / one-off reads). */
  getByCategory(category: EventCategory | string): Event[] {
    return this._events()
      .filter((e) => e.category === category)
      .sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime());
  }

  create(value: EventFormValue): Event {
    const event: Event = {
      id: uuid(),
      title: value.title,
      category: value.category,
      location: value.location,
      eventDate: value.eventDate,
      description: value.description,
      coverImage: value.coverImage ?? '/images/samples/deco-01.svg',
      thumbnailUrl: value.thumbnailUrl ?? '/images/samples/deco-01.svg',
      isFeatured: value.isFeatured,
      totalPhotos: 0,
      photos: [],
    };
    this._events.update((list) => [event, ...list]);
    return event;
  }

  update(id: string, value: EventFormValue): void {
    this._events.update((list) =>
      list.map((e) =>
        e.id === id
          ? {
              ...e,
              title: value.title,
              category: value.category,
              location: value.location,
              eventDate: value.eventDate,
              description: value.description,
              isFeatured: value.isFeatured,
              coverImage: value.coverImage ?? e.coverImage,
            }
          : e,
      ),
    );
  }

  delete(id: string): void {
    this._events.update((list) => list.filter((e) => e.id !== id));
  }

  /** Replace the full photo collection for an event (used after gallery uploads). */
  setPhotos(eventId: string, photos: EventPhoto[]): void {
    this._events.update((list) =>
      list.map((e) =>
        e.id === eventId
          ? {
              ...e,
              photos: [...photos],
              totalPhotos: photos.length,
              coverImage: photos.find((p) => p.sortOrder === 0)?.imageUrl ?? e.coverImage,
            }
          : e,
      ),
    );
  }

  addPhotos(eventId: string, photos: EventPhoto[]): void {
    const existing = this.getById(eventId)?.photos ?? [];
    this.setPhotos(eventId, [...existing, ...photos]);
  }
}

/**
 * Domain models for the Palmo Event Decorations portfolio.
 */

export enum EventCategory {
  ARANGETRAM = 'Arangetram',
  DANCE_EVENT = 'Dance Event',
  BIRTHDAY = 'Birthday',
  HALFSAREE = 'Half Saree',
  TEMPLE_POOJA = 'Temple Pooja',
  WEDDING = 'Wedding',
  ENGAGEMENT = 'Engagement',
  CORPORATE = 'Corporate',
  BABY_SHOWER = 'Baby Shower',
  HOUSE_WARMING = 'House Warming',
}

export interface EventPhoto {
  id: string;
  eventId: string;
  source?: string;
  imageUrl: string;
  thumbnailUrl: string;
  caption?: string;
  sortOrder: number;
}

export interface Event {
  id: string;
  title: string;
  category: EventCategory | string;
  location: string;
  eventDate: Date;
  description: string;
  coverImage: string;
  thumbnailUrl?: string;
  totalPhotos: number;
  isFeatured: boolean;
  photos: EventPhoto[];
}

/** Payload used by the create / edit event form. */
export interface EventFormValue {
  title: string;
  category: EventCategory | string;
  location: string;
  eventDate: Date;
  description: string;
  isFeatured: boolean;
  coverImage?: string;
  thumbnailUrl?: string;
}

/** Presentation metadata for a category (used by home sections, nav & routing). */
export interface CategoryInfo {
  key: EventCategory;
  label: string;
  /** Route slug, e.g. `arangetram`. */
  slug: string;
  /** Short marketing tagline shown under section titles. */
  tagline: string;
  icon: string;
}

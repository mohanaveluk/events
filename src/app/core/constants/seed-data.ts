import { Event, EventCategory, EventPhoto } from '../models/event.model';
import eventsData from './events.data.json';

/**
 * Shape of a single event entry in `events.data.json`.
 *
 * To add / change portfolio content, edit that JSON file — it is organised by
 * event and category. The `images` array drives the gallery: list N image paths
 * and exactly N photos are shown (cover = first image). Paths are root-relative
 * and served from the `public/` folder, e.g. `/images/arangetram/photo1.jpg`.
 */
interface EventJson {
  id: string;
  title: string;
  category: string;
  location: string;
  eventDate: string;
  isFeatured?: boolean;
  description?: string;
  source?: string;
  images: string[];
  original: string[];
}

interface EventsFile {
  events: EventJson[];
}

function toPhotos(eventId: string, source: string, images: string[], original: string[]): EventPhoto[] {
  const baseUrl = source ? source.endsWith('/') ? source : `${source}/` : '';
  return images.map((thumbnailUrl, i) => ({
    id: `${eventId}-p${i + 1}`,
    eventId,
    source: source,
    imageUrl: `${baseUrl}${original?.[i] ?? thumbnailUrl}`,
    thumbnailUrl: `${baseUrl}${thumbnailUrl}`,
    caption: `Photo ${i + 1}`,
    sortOrder: i,
  }));
}

/** Build the seed Event[] from the JSON data file. */
export function buildSeedEvents(): Event[] {
  const data = eventsData as EventsFile;

  return data.events.map((e) => {
    const photos = toPhotos(e.id, e.source!, e.images ?? [], e.original ?? []);
    return {
      id: e.id,
      title: e.title,
      category: (e.category as EventCategory) ?? e.category,
      location: e.location,
      eventDate: new Date(e.eventDate),
      description:
        e.description ??
        `An elegant ${e.category} celebration at ${e.location} by Palmo Event Decorations.`,
      coverImage: photos[0]?.imageUrl ?? '/images/samples/deco-01.svg',
      thumbnailUrl: photos[0]?.thumbnailUrl ?? '/images/samples/deco-01.svg',
      totalPhotos: photos.length,
      isFeatured: Boolean(e.isFeatured),
      photos,
    };
  });
}

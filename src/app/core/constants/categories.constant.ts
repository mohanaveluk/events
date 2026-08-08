import { CategoryInfo, EventCategory } from '../models/event.model';

/**
 * Master list of decoration categories with routing + presentation metadata.
 * Order here drives the nav menu and the home-page section order.
 */
export const CATEGORIES: CategoryInfo[] = [
  {
    key: EventCategory.ARANGETRAM,
    label: 'Arangetram',
    slug: 'arangetram',
    tagline: 'Graceful stages for a dancer’s debut',
    icon: 'self_improvement',
  },
  {
    key: EventCategory.DANCE_EVENT,
    label: 'Dance Event',
    slug: 'dance',
    tagline: 'Dazzling stages that move with the music',
    icon: 'music_note',
  },
  {
    key: EventCategory.BIRTHDAY,
    label: 'Birthday',
    slug: 'birthday',
    tagline: 'Playful themes for every age',
    icon: 'cake',
  },
  // {
  //   key: EventCategory.HALFSAREE,
  //   label: 'Half Saree',
  //   slug: 'half-saree',
  //   tagline: 'Celebrating a coming of age in colour',
  //   icon: 'auto_awesome',
  // },
  {
    key: EventCategory.TEMPLE_POOJA,
    label: 'Temple Pooja',
    slug: 'temple-pooja',
    tagline: 'Serene, sacred floral settings',
    icon: 'temple_hindu',
  },
  {
    key: EventCategory.WEDDING,
    label: 'Wedding',
    slug: 'wedding',
    tagline: 'Timeless mandaps & grand stages',
    icon: 'favorite',
  },
  {
    key: EventCategory.ENGAGEMENT,
    label: 'Engagement',
    slug: 'engagement',
    tagline: 'Elegant beginnings, beautifully styled',
    icon: 'diamond',
  },
];

export const CATEGORY_BY_SLUG = new Map<string, CategoryInfo>(
  CATEGORIES.map((c) => [c.slug, c]),
);

export function slugForCategory(category: EventCategory | string): string {
  return CATEGORIES.find((c) => c.key === category)?.slug
    ?? String(category).toLowerCase().replace(/\s+/g, '-');
}

/**
 * App-wide static configuration and business details.
 */
export const APP_CONFIG = {
  brandName: 'Palmo Event Decorations',
  brandShort: 'Palmo',
  tagline: 'Creating Memorable Celebrations with Elegant Decorations',
  phone: '+1 (210) 343-9315',
  email: 'rlavanyam@gmail.com',
  serviceArea: 'San Antonio · Austin · Dallas, TX',
  social: {
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
    youtube: 'https://youtube.com',
  },
  gallery: {
    carouselIntervalMs: 4000,
    homeCardsPerSection: 4,
    acceptedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    maxUploadSizeMb: 8,
  },
} as const;

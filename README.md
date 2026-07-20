# Palmo Event Decorations — Portfolio

A production-ready **Angular 21** portfolio website for an event decoration studio.
Visitors browse previous decorations (Arangetram, Wedding, Birthday, Half Saree,
Temple Pooja, Engagement …) for inspiration; an admin area manages events and
uploads photo galleries.

Built with standalone components, **Signals**, zoneless change detection, Angular
Material, the CDK, lazy-loaded routes, SCSS and a responsive luxury gold theme.

---

## Tech stack

| Concern            | Choice                                             |
| ------------------ | -------------------------------------------------- |
| Framework          | Angular 21 (standalone, zoneless, signals)         |
| UI kit             | Angular Material 21 + CDK (drag-drop, table, forms)|
| Notifications      | ngx-toastr                                          |
| Dates              | dayjs (via a custom `dayjsDate` pipe)              |
| IDs                | uuid                                                |
| Styling            | SCSS + CSS custom properties (design tokens)       |

### A note on the requested libraries

`ngx-swiper-wrapper` is deprecated and has no Angular 21 support, and
`ngx-lightbox` is unreliable on Angular 21. Both were replaced with small,
dependency-free, signal-based components that provide the same features:

- **`ImageCarouselComponent`** — autoplay (4s), pause-on-hover, arrows, dots.
- **`LightboxComponent`** — zoom in/out, next/prev, fullscreen, keyboard nav,
  thumbnail strip.

Everything else (`@angular/material`, `@angular/cdk`, `ngx-toastr`, `uuid`,
`dayjs`) is installed as requested.

---

## Getting started

```bash
npm install
npm start          # ng serve → http://localhost:4200
npm run build      # production build → dist/
```

---

## Folder structure

```
src/app
├── core
│   ├── configs        # app.config.constants.ts
│   ├── constants      # categories, seed data
│   ├── guards         # admin.guard.ts
│   ├── interceptors   # error.interceptor.ts
│   ├── models         # event.model.ts (Event, EventPhoto, EventCategory)
│   └── services       # Event / Gallery / ImageUpload / Category / Auth
├── shared
│   ├── components      # event-card, image-carousel, lightbox, masonry-grid,
│   │                   #   section-header, skeleton-loader, empty-state
│   ├── directives      # lazy-img (IntersectionObserver lazy loading)
│   └── pipes           # dayjs-date
├── layouts             # header, footer, main-layout
├── features
│   ├── home            # hero + per-category sections
│   ├── events          # event-list (category page) + event-detail
│   ├── gallery         # masonry gallery with category filter
│   ├── contact         # contact form (reactive, validated)
│   └── admin           # admin-layout, dashboard, event-management,
│                       #   event-form, gallery-upload, admin.routes.ts
└── app.routes.ts
```

---

## Routes

| Path                              | Page                                  |
| --------------------------------- | ------------------------------------- |
| `/`                               | Home                                   |
| `/arangetram`, `/birthday`, `/half-saree`, `/temple-pooja`, `/wedding`, `/engagement` | Category landing (all events + photo grids) |
| `/event/:id`                      | Single event gallery                   |
| `/gallery`                        | Full portfolio (masonry + filters)     |
| `/contact`                        | Contact form                           |
| `/admin`                          | Admin dashboard                        |
| `/admin/events`                   | Manage events (Material table)         |
| `/admin/events/new`               | Create event                           |
| `/admin/events/edit/:id`          | Edit event                             |
| `/admin/upload-gallery/:eventId`  | Drag-and-drop gallery upload           |

Category slugs resolve dynamically from `core/constants/categories.constant.ts`,
so adding a category there automatically creates its nav item, home section and
route.

---

## Data & state

All data lives in a signal-backed in-memory store (`EventService`) seeded from
`core/constants/seed-data.ts` — a **mock API**. Swap the signal mutations for
`HttpClient` calls to attach a real backend without touching the UI. The
`errorInterceptor` is ready to register in `provideHttpClient` for real endpoints.

### Editing images (JSON-driven)

All portfolio content lives in **`src/app/core/constants/events.data.json`**,
organised event- and category-wise. Each event has an `images` array — list N
paths and exactly **N** photos render (the first is the cover). Paths are
root-relative and served from `public/`, e.g.:

```json
{
  "id": "arangetram-1",
  "title": "Arangetram1 @ UTSA",
  "category": "Arangetram",
  "location": "UTSA, San Antonio",
  "eventDate": "2026-07-04",
  "isFeatured": true,
  "images": [
    "/images/arangetram/utsa/1.jpg",
    "/images/arangetram/utsa/2.jpg",
    "/images/arangetram/utsa/3.jpg"
  ]
}
```

Drop your real photos under `public/images/...` and point the JSON paths at
them. The bundled `/images/samples/*.svg` are placeholders you can delete.
`category` must match a value in `EventCategory`. Clicking any photo opens the
zoomable lightbox.

## Admin gallery upload

`ImageUploadService.simulateUpload()` mimics a progressive upload (validation,
object-URL previews, 0→100% progress). The upload screen supports multi-select,
drag-and-drop, per-file progress bars, delete-before-upload, **CDK drag-to-reorder**
and **set cover image**. On completion the photos are appended to the event and
appear immediately in its gallery.

## Theme

Luxury **gold (#C8A74E) + white** with Cormorant Garamond headings and Poppins
body. Tokens are defined once in `styles.scss` (`--brand-*` custom properties)
and drive both Angular Material (`mat.theme`) and the custom components.

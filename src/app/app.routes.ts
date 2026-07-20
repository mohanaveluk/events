import { Routes } from '@angular/router';

import { MainLayoutComponent } from './layouts/main-layout/main-layout';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Admin area (declared first so /admin isn't captured by the public
  // :categorySlug wildcard child below).
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () => import('./features/admin/admin.routes'),
  },

  // Public site
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Palmo Event Decorations · Elegant Celebrations',
        loadComponent: () => import('./features/home/home').then((m) => m.HomeComponent),
      },
      {
        path: 'gallery',
        title: 'Gallery · Palmo Event Decorations',
        loadComponent: () => import('./features/gallery/gallery').then((m) => m.GalleryComponent),
      },
      {
        path: 'contact',
        title: 'Contact · Palmo Event Decorations',
        loadComponent: () => import('./features/contact/contact').then((m) => m.ContactComponent),
      },
      {
        path: 'event/:id',
        title: 'Event · Palmo Event Decorations',
        loadComponent: () =>
          import('./features/events/event-detail/event-detail').then((m) => m.EventDetailComponent),
      },
      {
        // Category landing pages: /arangetram, /wedding, /half-saree, …
        path: ':categorySlug',
        title: 'Decorations · Palmo Event Decorations',
        loadComponent: () =>
          import('./features/events/event-list/event-list').then((m) => m.EventListComponent),
      },
    ],
  },

  { path: '**', redirectTo: '' },
];

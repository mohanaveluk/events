import { Routes } from '@angular/router';

import { AdminLayoutComponent } from './admin-layout/admin-layout';

/**
 * Admin feature routes (lazy-loaded from app.routes). Every child component is
 * itself lazily loaded for optimal initial bundle size.
 */
const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        title: 'Admin · Dashboard',
        loadComponent: () => import('./dashboard/dashboard').then((m) => m.DashboardComponent),
      },
      {
        path: 'events',
        title: 'Admin · Manage Events',
        loadComponent: () =>
          import('./event-management/event-management').then((m) => m.EventManagementComponent),
      },
      {
        path: 'events/new',
        title: 'Admin · New Event',
        loadComponent: () => import('./event-form/event-form').then((m) => m.EventFormComponent),
      },
      {
        path: 'events/edit/:id',
        title: 'Admin · Edit Event',
        loadComponent: () => import('./event-form/event-form').then((m) => m.EventFormComponent),
      },
      {
        path: 'upload-gallery/:eventId',
        title: 'Admin · Upload Gallery',
        loadComponent: () =>
          import('./gallery-upload/gallery-upload').then((m) => m.GalleryUploadComponent),
      },
      {
        path: 'pricing',
        title: 'Admin · Pricing Packages',
        loadComponent: () =>
          import('./pricing-management/pricing-management').then((m) => m.PricingManagementComponent),
      },
    ],
  },
];

export default ADMIN_ROUTES;

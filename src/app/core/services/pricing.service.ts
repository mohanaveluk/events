import { computed, Injectable, signal } from '@angular/core';
import { v4 as uuid } from 'uuid';

import {
  ComparisonRow,
  PricingPackage,
  PricingPackageFormValue,
} from '../models/pricing.model';
import pricingData from '../constants/pricing-packages.data.json';

/**
 * Configuration-driven pricing store backed by Angular signals. All packages are
 * loaded from `pricing-packages.data.json`; admin CRUD mutates the signal. Swap
 * the mutations for HTTP calls to persist to a backend without UI changes.
 */
@Injectable({ providedIn: 'root' })
export class PricingService {
  private readonly _packages = signal<PricingPackage[]>(
    (pricingData as { packages: PricingPackage[] }).packages.map((p) => ({ ...p })),
  );

  /** Packages ordered by `sortOrder` (then price). */
  readonly packages = computed(() =>
    [...this._packages()].sort(
      (a, b) => a.sortOrder - b.sortOrder || a.price - b.price,
    ),
  );

  readonly popular = computed(() => this._packages().find((p) => p.isPopular));

  /** Fixed comparison matrix rows; inclusion is derived from feature titles. */
  readonly comparisonRows: ComparisonRow[] = [
    { label: 'Backdrop', keywords: ['backdrop', 'wall'] },
    { label: 'Floral Decoration', keywords: ['floral', 'flower', 'garland'] },
    { label: 'LED Lighting', keywords: ['led', 'lighting', 'uplighting'] },
    { label: 'Entrance Decoration', keywords: ['entrance', 'arch', 'tunnel'] },
    { label: 'Photo Booth', keywords: ['photo booth', 'photo area', 'photo zone'] },
    { label: 'Fresh Flowers', keywords: ['fresh flower'] },
    { label: 'VIP Setup', keywords: ['vip'] },
  ];

  getById(id: string): PricingPackage | undefined {
    return this._packages().find((p) => p.id === id);
  }

  selectById(id: string) {
    return computed(() => this._packages().find((p) => p.id === id));
  }

  /** True when a package has an included feature matching any keyword. */
  hasFeature(pkg: PricingPackage, keywords: string[]): boolean {
    return pkg.features.some(
      (f) =>
        f.included &&
        keywords.some((k) => f.title.toLowerCase().includes(k.toLowerCase())),
    );
  }

  // ---- Admin CRUD ----
  create(value: PricingPackageFormValue): PricingPackage {
    const pkg: PricingPackage = {
      id: uuid(),
      sortOrder: this._packages().length + 1,
      ...value,
    };
    this._packages.update((list) => [...list, pkg]);
    return pkg;
  }

  update(id: string, value: Partial<PricingPackage>): void {
    this._packages.update((list) =>
      list.map((p) => (p.id === id ? { ...p, ...value } : p)),
    );
  }

  delete(id: string): void {
    this._packages.update((list) => list.filter((p) => p.id !== id));
  }

  /** Persist a new image ordering (thumbnail / display / original in lockstep). */
  setImages(
    id: string,
    thumbnailImages: string[],
    displayImages: string[],
    originalImages: string[],
  ): void {
    this.update(id, { thumbnailImages, displayImages, originalImages });
  }
}

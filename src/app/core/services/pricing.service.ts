import { computed, Injectable, Signal, signal } from '@angular/core';
import { v4 as uuid } from 'uuid';

import {
  ComparisonRow,
  PricingDesign,
  PricingPackage,
  PricingPackageFormValue,
} from '../models/pricing.model';
import pricingData from '../constants/pricing-packages.data.json';

/**
 * Configuration-driven pricing store backed by Angular signals. All packages are
 * loaded from `pricing-packages.data.json`; admin CRUD mutates the signal. Swap
 * the mutations for HTTP calls to persist to a backend without UI changes.
 *
 * Core hierarchy: Package → Design Module → Images.
 */
@Injectable({ providedIn: 'root' })
export class PricingService {
  private readonly _packages = signal<PricingPackage[]>(
    (pricingData as { packages: PricingPackage[] }).packages.map((p) => ({ ...p })),
  );

  /** Packages ordered by `sortOrder` (then price). */
  private readonly _sorted = computed(() =>
    [...this._packages()].sort((a, b) => a.sortOrder - b.sortOrder || a.price - b.price),
  );

  /** Reactive list of all packages. */
  getPackages(): Signal<PricingPackage[]> {
    return this._sorted;
  }

  /** Convenience alias used by templates. */
  readonly packages = this._sorted;

  readonly popular = computed(() => this._packages().find((p) => p.isPopular));

  getPackageById(id: string): PricingPackage | undefined {
    return this._packages().find((p) => p.id === id);
  }

  /** Reactive selector for a single package. */
  selectPackageById(id: string) {
    return computed(() => this._packages().find((p) => p.id === id));
  }

  getDesignsByPackageId(packageId: string): PricingDesign[] {
    return [...(this.getPackageById(packageId)?.designs ?? [])].sort(
      (a, b) => a.sortOrder - b.sortOrder,
    );
  }

  getDesignById(packageId: string, designId: string): PricingDesign | undefined {
    return this.getPackageById(packageId)?.designs.find((d) => d.id === designId);
  }

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

  /** True when a package has an included feature matching any keyword. */
  hasFeature(pkg: PricingPackage, keywords: string[]): boolean {
    return pkg.features.some(
      (f) =>
        f.included && keywords.some((k) => f.title.toLowerCase().includes(k.toLowerCase())),
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
}

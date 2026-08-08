/**
 * Domain models for the Pricing module. All pricing content is configuration
 * driven — see `core/constants/pricing-packages.data.json`.
 */

export interface PricingFeature {
  title: string;
  description?: string;
  included: boolean;
}

export interface PricingAddon {
  name: string;
  price: number;
}

export interface PricingPackage {
  id: string;
  packageName: string;
  category: string;
  price: number;
  badge?: string;
  shortDescription: string;
  /** Small images used in the card carousel. */
  thumbnailImages: string[];
  /** Medium images used for on-page display. */
  displayImages: string[];
  /** Full-resolution images opened in the full-screen viewer. */
  originalImages: string[];
  features: PricingFeature[];
  addons?: PricingAddon[];
  isPopular?: boolean;
  sortOrder: number;
}

/** Payload used by the admin create / edit pricing form. */
export interface PricingPackageFormValue {
  packageName: string;
  category: string;
  price: number;
  badge?: string;
  shortDescription: string;
  isPopular: boolean;
  features: PricingFeature[];
  addons: PricingAddon[];
  thumbnailImages: string[];
  displayImages: string[];
  originalImages: string[];
}

/** A single row in the package comparison table. */
export interface ComparisonRow {
  label: string;
  /** Keywords matched against feature titles to decide inclusion per package. */
  keywords: string[];
}

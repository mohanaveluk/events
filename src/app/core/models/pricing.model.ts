/**
 * Domain models for the Pricing module. All pricing content is configuration
 * driven — see `core/constants/pricing-packages.data.json`.
 *
 * Core hierarchy: Package → Design Module → Images.
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

/**
 * A single photograph within a design. Three resolutions mirror the events
 * image architecture: `thumbnail` (small), `display` (medium, used as a preload
 * while the original loads) and `original` (full-resolution, shown in the viewer).
 */
export interface PricingImage {
  id: string;
  thumbnail: string;
  display: string;
  original: string;
  alt?: string;
  caption?: string;
  sortOrder: number;
}

/** One complete decoration concept/model, containing multiple photographs. */
export interface PricingDesign {
  id: string;
  name: string;
  description?: string;
  /** Representative cover thumbnail shown on the pricing card. */
  coverImage: string;
  images: PricingImage[];
  sortOrder: number;
}

export interface PricingPackage {
  id: string;
  packageName: string;
  category: string;
  price: number;
  badge?: string;
  shortDescription: string;
  features: PricingFeature[];
  addons?: PricingAddon[];
  designs: PricingDesign[];
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
  designs: PricingDesign[];
}

/** Data passed into the image-viewer dialog. */
export interface PricingViewerData {
  images: PricingImage[];
  selectedIndex: number;
  designName?: string;
}

/** A single row in the package comparison table. */
export interface ComparisonRow {
  label: string;
  /** Keywords matched against feature titles to decide inclusion per package. */
  keywords: string[];
}

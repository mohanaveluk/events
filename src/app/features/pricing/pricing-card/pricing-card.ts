import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

import { PricingPackage } from '../../../core/models/pricing.model';
import { ImageCarouselComponent } from '../../../shared/components/image-carousel/image-carousel';

export interface PricingImageOpen {
  images: string[];
  index: number;
}

/**
 * A single pricing slab rendered as a Material card: reused image carousel on
 * top, package name / price / badge, included features and a View Details CTA.
 */
@Component({
  selector: 'app-pricing-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatButtonModule, ImageCarouselComponent],
  templateUrl: './pricing-card.html',
  styleUrl: './pricing-card.scss',
})
export class PricingCardComponent {
  readonly pkg = input.required<PricingPackage>();

  /** Emitted when a carousel image is clicked → parent opens the full-screen viewer. */
  readonly openImage = output<PricingImageOpen>();
  readonly viewDetails = output<PricingPackage>();

  onImageClick(index: number): void {
    const p = this.pkg();
    this.openImage.emit({
      images: p.originalImages.length ? p.originalImages : p.displayImages,
      index,
    });
  }
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PricingService } from '../../core/services/pricing.service';
import { PricingPackage } from '../../core/models/pricing.model';
import { PricingCardComponent, PricingImageOpen } from './pricing-card/pricing-card';
import { PricingComparisonComponent } from './pricing-comparison/pricing-comparison';
import { PricingImageViewerComponent } from './pricing-image-viewer/pricing-image-viewer';

@Component({
  selector: 'app-pricing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    PricingCardComponent,
    PricingComparisonComponent,
    PricingImageViewerComponent,
  ],
  templateUrl: './pricing.html',
  styleUrl: './pricing.scss',
})
export class PricingComponent {
  private readonly pricing = inject(PricingService);

  protected readonly packages = this.pricing.packages;

  // Full-screen viewer state
  protected readonly viewerImages = signal<string[]>([]);
  protected readonly viewerStart = signal(0);
  protected readonly viewerOpen = signal(false);

  // Details modal state
  protected readonly detailsPkg = signal<PricingPackage | null>(null);

  openImage(e: PricingImageOpen): void {
    this.viewerImages.set(e.images);
    this.viewerStart.set(e.index);
    this.viewerOpen.set(true);
  }

  closeViewer(): void {
    this.viewerOpen.set(false);
  }

  openDetails(pkg: PricingPackage): void {
    this.detailsPkg.set(pkg);
  }

  closeDetails(): void {
    this.detailsPkg.set(null);
  }

  viewDetailsPhotos(pkg: PricingPackage): void {
    this.openImage({
      images: pkg.originalImages.length ? pkg.originalImages : pkg.displayImages,
      index: 0,
    });
  }
}

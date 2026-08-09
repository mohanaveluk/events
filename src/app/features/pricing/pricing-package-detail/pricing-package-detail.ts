import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { PricingService } from '../../../core/services/pricing.service';
import { PricingDesign } from '../../../core/models/pricing.model';
import { PricingImageViewerComponent } from '../pricing-image-viewer/pricing-image-viewer';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state';

/**
 * Package detail page (/pricing/:packageId). Shows the package summary, features
 * and every design module with its thumbnail grid. Clicking a thumbnail opens the
 * image-viewer dialog scoped to that design's images only.
 */
@Component({
  selector: 'app-pricing-package-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatDialogModule, EmptyStateComponent],
  templateUrl: './pricing-package-detail.html',
  styleUrl: './pricing-package-detail.scss',
})
export class PricingPackageDetailComponent {
  private readonly pricing = inject(PricingService);
  private readonly dialog = inject(MatDialog);

  /** Bound from the `:packageId` route param. */
  readonly packageId = input.required<string>();

  protected readonly pkg = computed(() => this.pricing.getPackageById(this.packageId()));
  protected readonly designs = computed(() =>
    [...(this.pkg()?.designs ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
  );

  openImageViewer(design: PricingDesign, selectedImageIndex: number): void {
    this.dialog.open(PricingImageViewerComponent, {
      data: {
        images: [...design.images].sort((a, b) => a.sortOrder - b.sortOrder),
        selectedIndex: selectedImageIndex,
        designName: design.name,
      },
      panelClass: 'pricing-viewer-panel',
      maxWidth: '100vw',
      autoFocus: false,
      restoreFocus: true,
    });
  }
}

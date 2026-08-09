import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';

import { PricingPackage } from '../../../core/models/pricing.model';

/**
 * A single pricing slab rendered as a Material card: a representative cover
 * thumbnail per design, the number of design options, included features and a
 * "View Designs →" link to the package detail page.
 */
@Component({
  selector: 'app-pricing-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatCardModule],
  templateUrl: './pricing-card.html',
  styleUrl: './pricing-card.scss',
})
export class PricingCardComponent {
  readonly pkg = input.required<PricingPackage>();

  /** Max design covers to preview on the card. */
  readonly maxCovers = input(4);

  protected readonly designCount = computed(() => this.pkg().designs.length);
  protected readonly coverDesigns = computed(() =>
    [...this.pkg().designs]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .slice(0, this.maxCovers()),
  );
  protected readonly extraCount = computed(() =>
    Math.max(0, this.designCount() - this.maxCovers()),
  );
}

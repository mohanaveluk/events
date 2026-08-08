import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { PricingService } from '../../../core/services/pricing.service';

/**
 * Feature comparison matrix across all pricing packages. Columns are packages
 * (with price), rows are the fixed comparison criteria; inclusion is derived
 * from each package's feature list via PricingService.
 */
@Component({
  selector: 'app-pricing-comparison',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pricing-comparison.html',
  styleUrl: './pricing-comparison.scss',
})
export class PricingComparisonComponent {
  private readonly pricing = inject(PricingService);

  protected readonly packages = this.pricing.packages;
  protected readonly rows = this.pricing.comparisonRows;

  /** Precomputed inclusion matrix: rows × packages → boolean. */
  protected readonly matrix = computed(() =>
    this.rows.map((row) => ({
      label: row.label,
      cells: this.packages().map((pkg) => this.pricing.hasFeature(pkg, row.keywords)),
    })),
  );
}

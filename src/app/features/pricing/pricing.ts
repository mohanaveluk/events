import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PricingService } from '../../core/services/pricing.service';
import { PricingCardComponent } from './pricing-card/pricing-card';
import { PricingComparisonComponent } from './pricing-comparison/pricing-comparison';

@Component({
  selector: 'app-pricing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PricingCardComponent, PricingComparisonComponent],
  templateUrl: './pricing.html',
  styleUrl: './pricing.scss',
})
export class PricingComponent {
  private readonly pricing = inject(PricingService);

  protected readonly packages = this.pricing.getPackages();
}

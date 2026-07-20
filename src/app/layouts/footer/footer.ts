import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { APP_CONFIG } from '../../core/configs/app.config.constants';
import { CategoryService } from '../../core/services/category.service';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class FooterComponent {
  private readonly categoryService = inject(CategoryService);

  protected readonly app = APP_CONFIG;
  protected readonly categories = this.categoryService.categories;
  protected readonly year = new Date().getFullYear();
}

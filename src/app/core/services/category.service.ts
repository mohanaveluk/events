import { Injectable } from '@angular/core';

import { CATEGORIES, CATEGORY_BY_SLUG } from '../constants/categories.constant';
import { CategoryInfo } from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  readonly categories: CategoryInfo[] = CATEGORIES;

  getBySlug(slug: string): CategoryInfo | undefined {
    return CATEGORY_BY_SLUG.get(slug);
  }

  /** All category values, including the extended ones used by the admin form. */
  allCategoryValues(): string[] {
    return CATEGORIES.map((c) => c.key);
  }
}

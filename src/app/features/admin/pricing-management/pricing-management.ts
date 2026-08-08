import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';

import { PricingService } from '../../../core/services/pricing.service';
import { CategoryService } from '../../../core/services/category.service';
import { ImageUploadService } from '../../../core/services/image-upload.service';
import { PricingPackage } from '../../../core/models/pricing.model';
import { PricingImageViewerComponent } from '../../pricing/pricing-image-viewer/pricing-image-viewer';

const SAMPLE_IMAGES = Array.from(
  { length: 12 },
  (_, i) => `/images/samples/deco-${String(i + 1).padStart(2, '0')}.svg`,
);

@Component({
  selector: 'app-pricing-management',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DragDropModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatIconModule,
    MatButtonModule,
    PricingImageViewerComponent,
  ],
  templateUrl: './pricing-management.html',
  styleUrl: './pricing-management.scss',
})
export class PricingManagementComponent {
  private readonly fb = inject(FormBuilder);
  private readonly pricing = inject(PricingService);
  private readonly categoryService = inject(CategoryService);
  private readonly uploadService = inject(ImageUploadService);
  private readonly toastr = inject(ToastrService);

  protected readonly packages = this.pricing.packages;
  protected readonly categories = ['All Events', ...this.categoryService.allCategoryValues()];
  protected readonly sampleImages = SAMPLE_IMAGES;

  /** null = list view; '' (empty id) or an id = editor open. */
  protected readonly editingId = signal<string | null>(null);
  protected readonly isEditorOpen = computed(() => this.editingId() !== null);
  protected readonly images = signal<string[]>([]);
  protected readonly pendingDelete = signal<PricingPackage | null>(null);

  // Preview (full-screen viewer) state
  protected readonly previewImages = signal<string[]>([]);
  protected readonly previewOpen = signal(false);

  protected readonly form: FormGroup = this.fb.group({
    packageName: ['', [Validators.required, Validators.minLength(2)]],
    category: ['All Events', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    badge: [''],
    shortDescription: ['', Validators.required],
    isPopular: [false],
    features: this.fb.array([]),
    addons: this.fb.array([]),
  });

  get features(): FormArray {
    return this.form.get('features') as FormArray;
  }

  get addons(): FormArray {
    return this.form.get('addons') as FormArray;
  }

  // ---- Editor open / close ----
  newPackage(): void {
    this.resetForm();
    this.images.set([]);
    this.editingId.set('');
  }

  editPackage(pkg: PricingPackage): void {
    this.resetForm();
    this.form.patchValue({
      packageName: pkg.packageName,
      category: pkg.category,
      price: pkg.price,
      badge: pkg.badge ?? '',
      shortDescription: pkg.shortDescription,
      isPopular: Boolean(pkg.isPopular),
    });
    pkg.features.forEach((f) => this.features.push(this.featureGroup(f.title, f.included, f.description)));
    (pkg.addons ?? []).forEach((a) => this.addons.push(this.addonGroup(a.name, a.price)));
    this.images.set([...(pkg.originalImages.length ? pkg.originalImages : pkg.displayImages)]);
    this.editingId.set(pkg.id);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  private resetForm(): void {
    this.form.reset({ category: 'All Events', price: 0, isPopular: false });
    this.features.clear();
    this.addons.clear();
  }

  // ---- Features ----
  private featureGroup(title = '', included = true, description = '') {
    return this.fb.group({
      title: [title, Validators.required],
      included: [included],
      description: [description],
    });
  }
  addFeature(): void {
    this.features.push(this.featureGroup());
  }
  removeFeature(i: number): void {
    this.features.removeAt(i);
  }

  // ---- Addons ----
  private addonGroup(name = '', price = 0) {
    return this.fb.group({
      name: [name, Validators.required],
      price: [price, [Validators.required, Validators.min(0)]],
    });
  }
  addAddon(): void {
    this.addons.push(this.addonGroup());
  }
  removeAddon(i: number): void {
    this.addons.removeAt(i);
  }

  // ---- Images ----
  addSampleImage(path: string): void {
    this.images.update((list) => [...list, path]);
  }

  addImageByPath(input: HTMLInputElement): void {
    const value = input.value.trim();
    if (value) {
      this.images.update((list) => [...list, value]);
      input.value = '';
    }
  }

  onFilesSelected(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (!input.files) return;
    for (const file of Array.from(input.files)) {
      const check = this.uploadService.validate(file);
      if (!check.valid) {
        this.toastr.error(check.reason ?? 'Invalid file');
        continue;
      }
      const url = this.uploadService.createPreview(file);
      this.images.update((list) => [...list, url]);
    }
    input.value = '';
  }

  removeImage(i: number): void {
    this.images.update((list) => list.filter((_, idx) => idx !== i));
  }

  reorderImages(e: CdkDragDrop<string[]>): void {
    this.images.update((list) => {
      const copy = [...list];
      moveItemInArray(copy, e.previousIndex, e.currentIndex);
      return copy;
    });
  }

  // ---- Save ----
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.warning('Please complete the required fields.');
      return;
    }
    if (!this.images().length) {
      this.toastr.warning('Add at least one image.');
      return;
    }

    const raw = this.form.getRawValue() as {
      packageName: string;
      category: string;
      price: number;
      badge: string;
      shortDescription: string;
      isPopular: boolean;
      features: { title: string; included: boolean; description: string }[];
      addons: { name: string; price: number }[];
    };
    const imgs = this.images();
    const payload = {
      packageName: raw.packageName,
      category: raw.category,
      price: Number(raw.price),
      badge: raw.badge || undefined,
      shortDescription: raw.shortDescription,
      isPopular: raw.isPopular,
      features: raw.features,
      addons: raw.addons,
      thumbnailImages: imgs,
      displayImages: imgs,
      originalImages: imgs,
    };

    const id = this.editingId();
    if (id) {
      this.pricing.update(id, payload);
      this.toastr.success('Package updated.');
    } else {
      this.pricing.create(payload);
      this.toastr.success('Package created.');
    }
    this.editingId.set(null);
  }

  // ---- Delete ----
  askDelete(pkg: PricingPackage): void {
    this.pendingDelete.set(pkg);
  }
  cancelDelete(): void {
    this.pendingDelete.set(null);
  }
  confirmDelete(): void {
    const pkg = this.pendingDelete();
    if (!pkg) return;
    this.pricing.delete(pkg.id);
    this.pendingDelete.set(null);
    this.toastr.success(`“${pkg.packageName}” deleted.`);
  }

  // ---- Preview ----
  preview(pkg: PricingPackage): void {
    this.previewImages.set(pkg.originalImages.length ? pkg.originalImages : pkg.displayImages);
    this.previewOpen.set(true);
  }
  closePreview(): void {
    this.previewOpen.set(false);
  }
}

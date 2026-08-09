import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { v4 as uuid } from 'uuid';
import { ToastrService } from 'ngx-toastr';

import { PricingService } from '../../../core/services/pricing.service';
import { CategoryService } from '../../../core/services/category.service';
import { ImageUploadService } from '../../../core/services/image-upload.service';
import { PricingDesign, PricingImage, PricingPackage } from '../../../core/models/pricing.model';
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
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './pricing-management.html',
  styleUrl: './pricing-management.scss',
})
export class PricingManagementComponent {
  private readonly fb = inject(FormBuilder);
  private readonly pricing = inject(PricingService);
  private readonly categoryService = inject(CategoryService);
  private readonly uploadService = inject(ImageUploadService);
  private readonly dialog = inject(MatDialog);
  private readonly toastr = inject(ToastrService);

  protected readonly packages = this.pricing.getPackages();
  protected readonly categories = ['All Events', ...this.categoryService.allCategoryValues()];
  protected readonly sampleImages = SAMPLE_IMAGES;

  protected readonly editingId = signal<string | null>(null);
  protected readonly isEditorOpen = computed(() => this.editingId() !== null);
  protected readonly pendingDelete = signal<PricingPackage | null>(null);

  protected readonly form: FormGroup = this.fb.group({
    packageName: ['', [Validators.required, Validators.minLength(2)]],
    category: ['All Events', Validators.required],
    price: [0, [Validators.required, Validators.min(0)]],
    badge: [''],
    shortDescription: ['', Validators.required],
    isPopular: [false],
    features: this.fb.array([]),
    addons: this.fb.array([]),
    designs: this.fb.array([]),
  });

  get features(): FormArray {
    return this.form.get('features') as FormArray;
  }
  get addons(): FormArray {
    return this.form.get('addons') as FormArray;
  }
  get designs(): FormArray {
    return this.form.get('designs') as FormArray;
  }
  designImages(designIndex: number): FormArray {
    return this.designs.at(designIndex).get('images') as FormArray;
  }

  // ---- Open / close editor ----
  newPackage(): void {
    this.resetForm();
    this.addDesign();
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
    [...pkg.designs]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach((d) => this.designs.push(this.designGroup(d)));
    this.editingId.set(pkg.id);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  private resetForm(): void {
    this.form.reset({ category: 'All Events', price: 0, isPopular: false });
    this.features.clear();
    this.addons.clear();
    this.designs.clear();
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

  // ---- Designs ----
  private designGroup(d?: PricingDesign) {
    const group = this.fb.group({
      id: [d?.id ?? ''],
      name: [d?.name ?? '', Validators.required],
      description: [d?.description ?? ''],
      images: this.fb.array([]),
    });
    const images = group.get('images') as FormArray;
    (d?.images ?? [])
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach((img) => images.push(this.imageGroup(img)));
    return group;
  }
  addDesign(): void {
    this.designs.push(this.designGroup());
  }
  removeDesign(i: number): void {
    this.designs.removeAt(i);
  }

  // ---- Design images ----
  private imageGroup(img?: PricingImage) {
    return this.fb.group({
      id: [img?.id ?? ''],
      thumbnail: [img?.thumbnail ?? '', Validators.required],
      display: [img?.display ?? ''],
      original: [img?.original ?? '', Validators.required],
      caption: [img?.caption ?? ''],
      alt: [img?.alt ?? ''],
    });
  }
  addImage(di: number): void {
    this.designImages(di).push(this.imageGroup());
  }
  removeImage(di: number, ii: number): void {
    this.designImages(di).removeAt(ii);
  }
  addSampleImage(di: number, path: string): void {
    this.designImages(di).push(
      this.imageGroup({ id: '', thumbnail: path, display: path, original: path, sortOrder: 0 }),
    );
  }
  onFilesSelected(di: number, e: Event): void {
    const input = e.target as HTMLInputElement;
    if (!input.files) return;
    for (const file of Array.from(input.files)) {
      const check = this.uploadService.validate(file);
      if (!check.valid) {
        this.toastr.error(check.reason ?? 'Invalid file');
        continue;
      }
      const url = this.uploadService.createPreview(file);
      this.designImages(di).push(
        this.imageGroup({ id: '', thumbnail: url, display: url, original: url, sortOrder: 0 }),
      );
    }
    input.value = '';
  }

  previewDesign(di: number): void {
    const images = this.buildImages(this.designImages(di));
    if (!images.length) {
      this.toastr.info('Add at least one image to preview.');
      return;
    }
    this.dialog.open(PricingImageViewerComponent, {
      data: {
        images,
        selectedIndex: 0,
        designName: this.designs.at(di).get('name')?.value || 'Design preview',
      },
      panelClass: 'pricing-viewer-panel',
      maxWidth: '100vw',
      autoFocus: false,
    });
  }

  private buildImages(imagesArray: FormArray): PricingImage[] {
    return imagesArray.controls.map((c, i) => {
      const v = c.value as PricingImage & { display?: string };
      const thumb = v.thumbnail;
      return {
        id: v.id || uuid(),
        thumbnail: thumb,
        display: v.display || thumb,
        original: v.original || thumb,
        alt: v.alt,
        caption: v.caption,
        sortOrder: i + 1,
      };
    });
  }

  // ---- Save ----
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.warning('Please complete the required fields (including each image URL).');
      return;
    }
    if (!this.designs.length) {
      this.toastr.warning('Add at least one design.');
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

    const designs: PricingDesign[] = this.designs.controls.map((dc, di) => {
      const dv = dc.value as { id: string; name: string; description: string };
      const images = this.buildImages(dc.get('images') as FormArray);
      return {
        id: dv.id || uuid(),
        name: dv.name,
        description: dv.description || undefined,
        coverImage: images[0]?.thumbnail ?? SAMPLE_IMAGES[0],
        images,
        sortOrder: di + 1,
      };
    });

    if (designs.some((d) => !d.images.length)) {
      this.toastr.warning('Each design needs at least one image.');
      return;
    }

    const payload = {
      packageName: raw.packageName,
      category: raw.category,
      price: Number(raw.price),
      badge: raw.badge || undefined,
      shortDescription: raw.shortDescription,
      isPopular: raw.isPopular,
      features: raw.features,
      addons: raw.addons,
      designs,
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

  // ---- Preview from list ----
  previewPackage(pkg: PricingPackage): void {
    const first = [...pkg.designs].sort((a, b) => a.sortOrder - b.sortOrder)[0];
    if (!first) {
      this.toastr.info('This package has no designs yet.');
      return;
    }
    this.dialog.open(PricingImageViewerComponent, {
      data: { images: first.images, selectedIndex: 0, designName: first.name },
      panelClass: 'pricing-viewer-panel',
      maxWidth: '100vw',
      autoFocus: false,
    });
  }
}

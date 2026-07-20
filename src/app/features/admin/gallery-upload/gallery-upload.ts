import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { v4 as uuid } from 'uuid';
import { ToastrService } from 'ngx-toastr';

import { EventService } from '../../../core/services/event.service';
import { ImageUploadService } from '../../../core/services/image-upload.service';
import { EventPhoto } from '../../../core/models/event.model';
import { APP_CONFIG } from '../../../core/configs/app.config.constants';
import { MasonryGridComponent } from '../../../shared/components/masonry-grid/masonry-grid';

interface StagedFile {
  id: string;
  file: File;
  previewUrl: string;
  progress: number;
  status: 'ready' | 'uploading' | 'done' | 'error';
  isCover: boolean;
  uploadedUrl?: string;
}

@Component({
  selector: 'app-gallery-upload',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DragDropModule, MasonryGridComponent],
  templateUrl: './gallery-upload.html',
  styleUrl: './gallery-upload.scss',
})
export class GalleryUploadComponent {
  private readonly eventService = inject(EventService);
  private readonly uploadService = inject(ImageUploadService);
  private readonly toastr = inject(ToastrService);

  /** Bound from the `:eventId` route param. */
  readonly eventId = input.required<string>();

  protected readonly accept = APP_CONFIG.gallery.acceptedImageTypes.join(',');
  protected readonly event = computed(() => this.eventService.getById(this.eventId()));

  protected readonly staged = signal<StagedFile[]>([]);
  protected readonly dragOver = signal(false);
  protected readonly uploading = signal(false);

  protected readonly canUpload = computed(
    () => this.staged().some((f) => f.status === 'ready') && !this.uploading(),
  );

  // ---- Drag & drop / file selection ----
  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.dragOver.set(true);
  }

  onDragLeave(e: DragEvent): void {
    e.preventDefault();
    this.dragOver.set(false);
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.dragOver.set(false);
    if (e.dataTransfer?.files) {
      this.addFiles(e.dataTransfer.files);
    }
  }

  onBrowse(e: Event): void {
    const input = e.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(input.files);
      input.value = '';
    }
  }

  private addFiles(fileList: FileList): void {
    const next: StagedFile[] = [];
    for (const file of Array.from(fileList)) {
      const check = this.uploadService.validate(file);
      if (!check.valid) {
        this.toastr.error(check.reason ?? 'Invalid file');
        continue;
      }
      next.push({
        id: uuid(),
        file,
        previewUrl: this.uploadService.createPreview(file),
        progress: 0,
        status: 'ready',
        isCover: false,
      });
    }
    if (next.length) {
      this.staged.update((list) => {
        const merged = [...list, ...next];
        if (!merged.some((f) => f.isCover)) merged[0].isCover = true;
        return merged;
      });
    }
  }

  // ---- Staging management ----
  remove(id: string): void {
    this.staged.update((list) => {
      const target = list.find((f) => f.id === id);
      if (target) this.uploadService.revokePreview(target.previewUrl);
      const rest = list.filter((f) => f.id !== id);
      if (rest.length && !rest.some((f) => f.isCover)) rest[0].isCover = true;
      return rest;
    });
  }

  setCover(id: string): void {
    this.staged.update((list) => list.map((f) => ({ ...f, isCover: f.id === id })));
  }

  reorder(event: CdkDragDrop<StagedFile[]>): void {
    this.staged.update((list) => {
      const copy = [...list];
      moveItemInArray(copy, event.previousIndex, event.currentIndex);
      return copy;
    });
  }

  clearAll(): void {
    this.staged().forEach((f) => this.uploadService.revokePreview(f.previewUrl));
    this.staged.set([]);
  }

  // ---- Upload ----
  uploadAll(): void {
    const files = this.staged().filter((f) => f.status === 'ready');
    if (!files.length) return;
    this.uploading.set(true);

    let remaining = files.length;
    for (const item of files) {
      this.patch(item.id, { status: 'uploading' });
      this.uploadService.simulateUpload(item.file).subscribe({
        next: ({ progress, result }) => {
          this.patch(item.id, { progress });
          if (result) {
            this.patch(item.id, { status: 'done', uploadedUrl: result.imageUrl });
          }
        },
        error: () => {
          this.patch(item.id, { status: 'error' });
          if (--remaining === 0) this.finish();
        },
        complete: () => {
          if (--remaining === 0) this.finish();
        },
      });
    }
  }

  private finish(): void {
    const eventId = this.eventId();
    const done = this.staged().filter((f) => f.status === 'done');

    // Cover first, then remaining in staged order → assign sortOrder.
    const ordered = [...done].sort((a, b) => Number(b.isCover) - Number(a.isCover));
    const startIndex = this.event()?.photos.length ?? 0;

    const photos: EventPhoto[] = ordered.map((f, i) => ({
      id: uuid(),
      eventId,
      imageUrl: f.uploadedUrl ?? f.previewUrl,
      thumbnailUrl: f.uploadedUrl ?? f.previewUrl,
      caption: f.file.name.replace(/\.[^.]+$/, ''),
      sortOrder: startIndex + i,
    }));

    this.eventService.addPhotos(eventId, photos);
    this.uploading.set(false);
    this.staged.set([]);
    this.toastr.success(`${photos.length} photo(s) added to “${this.event()?.title}”.`);
  }

  private patch(id: string, changes: Partial<StagedFile>): void {
    this.staged.update((list) => list.map((f) => (f.id === id ? { ...f, ...changes } : f)));
  }
}

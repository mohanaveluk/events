import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ToastrService } from 'ngx-toastr';

import { EventService } from '../../../core/services/event.service';
import { CategoryService } from '../../../core/services/category.service';
import { EventFormValue } from '../../../core/models/event.model';

@Component({
  selector: 'app-event-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideNativeDateAdapter()],
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatCheckboxModule,
  ],
  templateUrl: './event-form.html',
  styleUrl: './event-form.scss',
})
export class EventFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly eventService = inject(EventService);
  private readonly categoryService = inject(CategoryService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

  /** Present in edit mode (route /admin/events/edit/:id). */
  readonly id = input<string>();

  protected readonly categories = this.categoryService.categories;
  protected readonly isEdit = computed(() => !!this.id());

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    category: ['', Validators.required],
    location: ['', Validators.required],
    eventDate: [new Date(), Validators.required],
    description: [''],
    isFeatured: [false],
  });

  constructor() {
    // Load existing values in edit mode whenever the route id resolves.
    effect(() => {
      const id = this.id();
      if (!id) return;
      const event = this.eventService.getById(id);
      if (event) {
        this.form.patchValue({
          title: event.title,
          category: event.category.toString(),
          location: event.location,
          eventDate: new Date(event.eventDate),
          description: event.description,
          isFeatured: event.isFeatured,
        });
      }
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.warning('Please complete the required fields.');
      return;
    }
    const value = this.form.getRawValue() as EventFormValue;
    const id = this.id();

    if (id) {
      this.eventService.update(id, value);
      this.toastr.success('Event updated.');
      this.router.navigate(['/admin/events']);
    } else {
      const created = this.eventService.create(value);
      this.toastr.success('Event created. Now add some photos!');
      this.router.navigate(['/admin/upload-gallery', created.id]);
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/events']);
  }
}

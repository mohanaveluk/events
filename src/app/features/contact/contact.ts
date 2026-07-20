import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { APP_CONFIG } from '../../core/configs/app.config.constants';
import { CategoryService } from '../../core/services/category.service';

@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class ContactComponent {
  private readonly fb = inject(FormBuilder);
  private readonly toastr = inject(ToastrService);
  private readonly categoryService = inject(CategoryService);

  protected readonly app = APP_CONFIG;
  protected readonly categories = this.categoryService.categories;
  protected readonly submitting = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    eventType: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.warning('Please complete the required fields.');
      return;
    }
    this.submitting.set(true);
    // Simulate an async send.
    setTimeout(() => {
      this.submitting.set(false);
      this.form.reset();
      this.toastr.success('Thank you! We’ll be in touch shortly.', 'Message sent');
    }, 800);
  }
}

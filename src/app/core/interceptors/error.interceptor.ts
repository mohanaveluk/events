import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';

/**
 * Surfaces HTTP failures as toasts. Registered via `withInterceptors` once a
 * real API is wired up (add to provideHttpClient in app.config.ts).
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastr = inject(ToastrService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message =
        error.error?.message ?? error.message ?? 'Something went wrong. Please try again.';
      toastr.error(message, 'Request failed');
      return throwError(() => error);
    }),
  );
};

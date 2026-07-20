import { Injectable, signal } from '@angular/core';

/**
 * Minimal mock auth service. In this portfolio demo the admin area is open, but
 * the plumbing (signal + guard) is in place to gate it behind real auth later.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _isAdmin = signal(true);
  readonly isAdmin = this._isAdmin.asReadonly();

  login(): void {
    this._isAdmin.set(true);
  }

  logout(): void {
    this._isAdmin.set(false);
  }
}

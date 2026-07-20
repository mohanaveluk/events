import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="empty">
      <span class="material-icons">{{ icon() }}</span>
      <h3>{{ title() }}</h3>
      @if (message()) {
        <p>{{ message() }}</p>
      }
      <ng-content />
    </div>
  `,
  styles: [
    `
      .empty {
        text-align: center;
        padding: clamp(40px, 8vw, 90px) 20px;
        color: var(--brand-muted);
      }
      .material-icons {
        font-size: 56px;
        color: var(--brand-gold-light);
      }
      h3 {
        margin: 16px 0 6px;
        color: var(--brand-ink);
      }
      p {
        margin: 0 auto;
        max-width: 420px;
      }
    `,
  ],
})
export class EmptyStateComponent {
  readonly icon = input('photo_library');
  readonly title = input.required<string>();
  readonly message = input<string>('');
}

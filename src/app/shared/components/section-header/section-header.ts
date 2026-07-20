import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Section title with an optional eyebrow tagline and a right-aligned
 * "View All →" router link.
 */
@Component({
  selector: 'app-section-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <header class="section-header">
      <div class="section-header__text">
        @if (eyebrow()) {
          <span class="section-header__eyebrow">{{ eyebrow() }}</span>
        }
        <h2 class="section-header__title">{{ title() }}</h2>
      </div>

      @if (viewAllLink()) {
        <a class="section-header__link" [routerLink]="viewAllLink()">
          {{ viewAllLabel() }} <span aria-hidden="true">→</span>
        </a>
      }
    </header>
  `,
  styles: [
    `
      .section-header {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 28px;
        flex-wrap: wrap;
      }
      .section-header__eyebrow {
        display: inline-block;
        font-family: var(--font-body);
        font-size: 0.78rem;
        letter-spacing: 2px;
        text-transform: uppercase;
        color: var(--brand-gold-dark);
        margin-bottom: 4px;
      }
      .section-header__title {
        font-size: clamp(1.6rem, 3vw, 2.4rem);
        margin: 0;
      }
      .section-header__link {
        white-space: nowrap;
        font-weight: 500;
        color: var(--brand-gold-dark);
        transition: gap 0.2s ease, color 0.2s ease;
        display: inline-flex;
        gap: 6px;
      }
      .section-header__link:hover {
        color: var(--brand-gold);
        gap: 10px;
      }
    `,
  ],
})
export class SectionHeaderComponent {
  readonly title = input.required<string>();
  readonly eyebrow = input<string>('');
  readonly viewAllLink = input<string | unknown[] | null>(null);
  readonly viewAllLabel = input('View All');
}

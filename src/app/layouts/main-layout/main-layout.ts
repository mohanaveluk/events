import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from '../header/header';
import { FooterComponent } from '../footer/footer';
import { LightboxComponent } from '../../shared/components/lightbox/lightbox';

/**
 * Public site shell: sticky header, routed content, footer and the single
 * shared lightbox instance.
 */
@Component({
  selector: 'app-main-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, LightboxComponent],
  template: `
    <app-header />
    <main class="main">
      <router-outlet />
    </main>
    <app-footer />
    <app-lightbox />
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }
      .main {
        flex: 1;
      }
    `,
  ],
})
export class MainLayoutComponent {}

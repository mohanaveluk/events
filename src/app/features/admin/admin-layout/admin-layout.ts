import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
})
export class AdminLayoutComponent {
  protected readonly sidebarOpen = signal(false);

  protected readonly nav = [
    { label: 'Dashboard', icon: 'dashboard', link: '/admin', exact: true },
    { label: 'Manage Events', icon: 'event_note', link: '/admin/events', exact: false },
    { label: 'Add Event', icon: 'add_circle', link: '/admin/events/new', exact: false },
  ];

  toggleSidebar(): void {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from '../navigation/navigation.component';
import { HeaderComponent } from '../header/header.component';
import { ToastContainerComponent } from '../../../shared/components/toast/toast-container.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavigationComponent,
    HeaderComponent,
    ToastContainerComponent
  ],
  template: `
    <div class="main-layout">
      <app-navigation class="layout-sidebar"></app-navigation>

      <div class="layout-content">
        <app-header class="layout-header"></app-header>

        <main class="layout-main">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>

    <app-toast-container></app-toast-container>
  `,
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {}

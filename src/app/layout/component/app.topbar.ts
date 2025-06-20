import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { AuthService } from '../../services/auth/auth.service';
import { TagModule } from 'primeng/tag';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator, TagModule],
    template: ` <div class="layout-topbar" style="display: flex; align-items: center; justify-content: center;">
    <div class="layout-topbar-logo-container" style="position: absolute; left: 1rem; display: flex; align-items: center; gap: 1rem;">
        <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
            <i class="pi pi-bars"></i>
        </button>
        <div class="flex gap-2">
            <p-tag *ngFor="let role of userRoles" [value]="role" severity="info"></p-tag>
        </div>
    </div>

    <a class="layout-topbar-logo" routerLink="/" style="display: flex; flex-direction: column; align-items: center;">
    <img [src]="layoutService.isDarkTheme() ? 'logo/wirin-white.png' : 'logo/wirin.png'" alt="Logo" width="54" />
        
    </a>

    <div class="layout-topbar-actions" style="position: absolute; right: 1rem; display: flex; gap: 1rem;">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                    <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                </button>
                <app-configurator />
            
            </div>

            <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <div class="layout-topbar-menu-content">
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-calendar"></i>
                        <span>Calendar</span>
                    </button>
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-inbox"></i>
                        <span>Messages</span>
                    </button>
                    <button type="button" class="layout-topbar-action" (click)="goToProfile()">
                        <i class="pi pi-user"></i>
                        <span>Profile</span>
                    </button>
                    <button type="button" class="layout-topbar-action" (click)="logout()">
                        <i class="pi pi-sign-out"></i>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    </div>`
})
export class AppTopbar {
    items!: MenuItem[];
    userRoles: string[] = [];

    constructor(public layoutService: LayoutService,
        private router: Router,
        private authService: AuthService
    ) {
        this.userRoles = this.authService.getCurrentUserRole() || [];
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    goToProfile() {
        this.router.navigate(['/wirin/profile']);
    }

    logout(): void {
        this.authService.logout();
      }
}

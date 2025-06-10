import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Toast } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule, Toast, ButtonModule],
    template: `
    <p-toast />
    <router-outlet></router-outlet>`
})
export class AppComponent {}
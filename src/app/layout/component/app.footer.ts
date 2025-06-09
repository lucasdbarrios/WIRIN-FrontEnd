import { Component } from '@angular/core';
import { LayoutService } from '../service/layout.service';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        <img [src]="layoutService.isDarkTheme() ? 'logo/wirin25-white.png' : 'logo/wirin25.png'" alt="Logo" width="54" />
    </div>`
})
export class AppFooter {
    constructor(public layoutService: LayoutService) {}
}

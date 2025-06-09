import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule, Toast, ButtonModule],
    providers: [MessageService],
    template: `
    <p-toast />
<router-outlet></router-outlet>`
})
export class AppComponent {

}
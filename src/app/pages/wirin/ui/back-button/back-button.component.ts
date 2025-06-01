import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { ButtonModule } from "primeng/button";


@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './back-button.component.html',
})
export class BackButtonComponent {

    constructor(private router: Router) {}
    goBack(): void {
        this.router.navigate(['/wirin/tasks']);
      }
}
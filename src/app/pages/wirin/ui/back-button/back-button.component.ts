import { Component } from "@angular/core";
import { Location } from "@angular/common";
import { ButtonModule } from "primeng/button";


@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './back-button.component.html',
})
export class BackButtonComponent {

    constructor(private location: Location) {}
    goBack(): void {
      this.location.back();
      }
}
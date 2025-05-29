import { Component } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { ActionButtonComponent } from "../ui/button/button.component";

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  standalone: true,
  imports: [CommonModule, AccordionModule, ActionButtonComponent],
})
export class UsersListComponent {
  users: any[] = [];

  constructor(private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAll().subscribe({
      next: (data: any[]) => {
        console.log(data);
        this.users = data;
      }
    }) 
  }
}
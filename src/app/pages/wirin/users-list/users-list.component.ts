import { Component } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { SelectModule } from 'primeng/select';
import { DropDown } from '../../../types/dropDown';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  standalone: true,
  imports: [CommonModule, AccordionModule, ButtonModule, CardModule, ToolbarModule,
    InputIconModule, InputTextModule, IconFieldModule, SelectModule, FormsModule,
  ],
})
export class UsersListComponent {
  allUsers: any[] = [];
  users: any[] = [];
  dropdownValue:  DropDown | null = null;
    dropdownValues: DropDown[] = [
        { name: 'Todos', value: '' },
        { name: 'Admin', value: 'Admin' },
        { name: 'Bibliotecario', value: 'Bibliotecario' },
        { name: 'Voluntario', value: 'Voluntario' },
        { name: 'Revisor', value: 'Voluntario Administrativo' },
        { name: 'Alumno', value: 'Alumno' },
        
    ];

  constructor(private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    const selectedState = this.dropdownValue?.value || '';
    
    const request = selectedState
        ? this.userService.getUsersByRole(selectedState)
        : this.userService.getAll();

        await request.subscribe({
          next: (data: any[]) => {
            this.allUsers = data;
            this.users = [...data];
          },
          error: error => {
              console.error('Error al obtener los usuarios:', error);
          }
      });
  }

  searchUsers(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.users = this.allUsers.filter(user =>
      user.fullName.toLowerCase().includes(query)
  );
}

  newUser(): void {
    this.router.navigate(['/wirin/add-user-form']);
  }

  updateUser(user: any): void {
    this.router.navigate(['/wirin/update-user-form', user.id]);
  }

  deleteUser(id: string): void {
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: error => {
        console.error('Error al eliminar el usuario:', error);
      }
    })
  }
}
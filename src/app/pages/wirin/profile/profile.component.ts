import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { User } from '../../../types/user.interface';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonModule, CardModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.getCurrentUser().subscribe({
      next: (userData) => {
        this.user = userData;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar el perfil:', error);
        this.errorMessage = 'No se pudo cargar la información del perfil.';
        this.isLoading = false;
      },
    });
  }
}
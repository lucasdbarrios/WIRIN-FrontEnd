import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { OrderService } from '../../../services/order/order.service';
import { UserService } from '../../../services/user/user.service';
import { Order } from '../../../types/order.interface';
import { User } from '../../../types/user.interface';

interface VolunteerStats {
  id: string;
  fullName: string;
  tasksCompleted: number;
  tasksApproved: number;
  tasksDenied: number;
  tasksInProgress: number;
  successRate: number;
  averageCompletionTime: number;
  priorityTasksCompleted: number;
  totalTasks: number;
  ranking: number;
}

@Component({
  selector: 'app-volunteer-ranking',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    TagModule,
    ButtonModule,
    ProgressBarModule
  ],
  templateUrl: './volunteer-ranking.component.html'
})
export class VolunteerRankingComponent implements OnInit {
  volunteers: VolunteerStats[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private orderService: OrderService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadVolunteerRanking();
  }

  async loadVolunteerRanking(): Promise<void> {
    try {
      this.isLoading = true;
      
      // Obtener todos los voluntarios
      const volunteers = await this.userService.getUsersByRole('Voluntario').toPromise();
      
      // Obtener todas las tareas
      const allTasks = await this.orderService.getOrders().toPromise();
      
      // Calcular estadísticas para cada voluntario
      const volunteerStats: VolunteerStats[] = [];
      
      for (const volunteer of volunteers || []) {
        const volunteerTasks = allTasks?.filter(task => task.voluntarioId === volunteer.id) || [];
        
        const stats = this.calculateVolunteerStats(volunteer, volunteerTasks);
        volunteerStats.push(stats);
      }
      
      // Ordenar por tasa de éxito y tareas completadas
      volunteerStats.sort((a, b) => {
        if (b.successRate !== a.successRate) {
          return b.successRate - a.successRate;
        }
        return b.tasksCompleted - a.tasksCompleted;
      });
      
      // Asignar ranking
      volunteerStats.forEach((volunteer, index) => {
        volunteer.ranking = index + 1;
      });
      
      this.volunteers = volunteerStats;
      
    } catch (error) {
      console.error('Error loading volunteer ranking:', error);
      this.errorMessage = 'Error al cargar el ranking de voluntarios';
    } finally {
      this.isLoading = false;
    }
  }

  private calculateVolunteerStats(volunteer: User, tasks: Order[]): VolunteerStats {
    const tasksCompleted = tasks.filter(task => task.status === 'Completada').length;
    const tasksApproved = tasks.filter(task => task.status === 'Aprobada').length;
    const tasksDenied = tasks.filter(task => task.status === 'Denegada').length;
    const tasksInProgress = tasks.filter(task => 
      task.status === 'En Proceso' || task.status === 'En Revisión'
    ).length;
    
    const totalFinishedTasks = tasksCompleted + tasksApproved + tasksDenied;
    const successfulTasks = tasksCompleted + tasksApproved;
    const successRate = totalFinishedTasks > 0 ? (successfulTasks / totalFinishedTasks) * 100 : 0;
    
    const priorityTasksCompleted = tasks.filter(task => 
      task.isPriority && (task.status === 'Completada' || task.status === 'Aprobada')
    ).length;
    
    // Calcular tiempo promedio de completado (simplificado)
    const completedTasks = tasks.filter(task => 
      task.status === 'Completada' || task.status === 'Aprobada'
    );
    
    let averageCompletionTime = 0;
    if (completedTasks.length > 0) {
      const totalTime = completedTasks.reduce((sum, task) => {
        const creationDate = new Date(task.creationDate);
        const limitDate = new Date(task.limitDate);
        const timeDiff = limitDate.getTime() - creationDate.getTime();
        return sum + Math.max(0, timeDiff / (1000 * 60 * 60 * 24)); // días
      }, 0);
      averageCompletionTime = totalTime / completedTasks.length;
    }
    
    return {
      id: volunteer.id || '',
      fullName: volunteer.fullName,
      tasksCompleted,
      tasksApproved,
      tasksDenied,
      tasksInProgress,
      successRate: Math.round(successRate * 100) / 100,
      averageCompletionTime: Math.round(averageCompletionTime * 100) / 100,
      priorityTasksCompleted,
      totalTasks: tasks.length,
      ranking: 0
    };
  }

  getSuccessRateSeverity(rate: number): string {
    if (rate >= 90) return 'success';
    if (rate >= 70) return 'info';
    if (rate >= 50) return 'warning';
    return 'danger';
  }

  getRankingBadgeClass(ranking: number): string {
    switch (ranking) {
      case 1: return 'bg-yellow-500 text-white';
      case 2: return 'bg-gray-400 text-white';
      case 3: return 'bg-orange-600 text-white';
      default: return 'bg-blue-500 text-white';
    }
  }

  refreshRanking(): void {
    this.loadVolunteerRanking();
  }

  getMostActiveVolunteer(): VolunteerStats | null {
    if (this.volunteers.length === 0) return null;
    return this.volunteers.reduce((prev, current) => 
      (prev.totalTasks > current.totalTasks) ? prev : current
    );
  }

  getAverageSuccessRate(): number {
    if (this.volunteers.length === 0) return 0;
    const totalRate = this.volunteers.reduce((sum, volunteer) => sum + volunteer.successRate, 0);
    return totalRate / this.volunteers.length;
  }
}
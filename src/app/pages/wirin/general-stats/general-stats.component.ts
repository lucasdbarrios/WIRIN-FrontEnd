import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { ChartModule } from 'primeng/chart';
import { OrderService } from '../../../services/order/order.service';
import { UserService } from '../../../services/user/user.service';
import { Order } from '../../../types/order.interface';
import { User } from '../../../types/user.interface';

interface UserStats {
  id: string;
  fullName: string;
  role: string;
  tasksCompleted: number;
  tasksApproved: number;
  tasksDenied: number;
  tasksInProgress: number;
  successRate: number;
  averageCompletionTime: number;
  priorityTasksCompleted: number;
  totalTasks: number;
}

interface GeneralStatistics {
  totalVolunteers: number;
  totalReviewers: number;
  totalTasks: number;
  completedTasks: number;
  approvedTasks: number;
  deniedTasks: number;
  inProgressTasks: number;
  overallSuccessRate: number;
  averageTasksPerUser: number;
  priorityTasksCompleted: number;
}

@Component({
  selector: 'app-general-stats',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    TableModule,
    TagModule,
    ButtonModule,
    ProgressBarModule,
    ChartModule
  ],
  templateUrl: './general-stats.component.html',
  styleUrls: ['./general-stats.component.scss']
})
export class GeneralStatsComponent implements OnInit {
  volunteers: UserStats[] = [];
  reviewers: UserStats[] = [];
  generalStats: GeneralStatistics = {
    totalVolunteers: 0,
    totalReviewers: 0,
    totalTasks: 0,
    completedTasks: 0,
    approvedTasks: 0,
    deniedTasks: 0,
    inProgressTasks: 0,
    overallSuccessRate: 0,
    averageTasksPerUser: 0,
    priorityTasksCompleted: 0
  };
  
  isLoading: boolean = true;
  errorMessage: string = '';
  chartData: any;
  chartOptions: any;

  constructor(
    private orderService: OrderService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadGeneralStats();
    this.initChart();
  }

  async loadGeneralStats(): Promise<void> {
    try {
      this.isLoading = true;
      
      // Obtener todos los voluntarios y revisores
      const volunteers = await this.userService.getUsersByRole('Voluntario').toPromise();
      const reviewers = await this.userService.getUsersByRole('Voluntario Administrativo').toPromise();
      
      // Obtener todas las tareas
      const allTasks = await this.orderService.getOrders().toPromise();
      
      // Calcular estadísticas para voluntarios
      this.volunteers = this.calculateUsersStats(volunteers || [], allTasks || [], 'Voluntario');
      
      // Calcular estadísticas para revisores
      this.reviewers = this.calculateUsersStats(reviewers || [], allTasks || [], 'Revisor');
      
      // Calcular estadísticas generales
      this.calculateGeneralStatistics(allTasks || []);
      
      // Actualizar gráfico
      this.updateChart();
      
    } catch (error) {
      console.error('Error loading general stats:', error);
      this.errorMessage = 'Error al cargar las estadísticas generales';
    } finally {
      this.isLoading = false;
    }
  }

  private calculateUsersStats(users: User[], allTasks: Order[], role: string): UserStats[] {
    return users.map(user => {
      const userTasks = allTasks.filter(task => {
        if (role === 'Voluntario') {
          return task.voluntarioId === user.id;
        } else {
          return task.revisorId === user.id;
        }
      });
      
      return this.calculateUserStats(user, userTasks, role);
    });
  }

  private calculateUserStats(user: User, tasks: Order[], role: string): UserStats {
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
    
    // Calcular tiempo promedio de completado
    const completedTasks = tasks.filter(task => 
      task.status === 'Completada' || task.status === 'Aprobada'
    );
    
    let averageCompletionTime = 0;
    if (completedTasks.length > 0) {
      const totalDays = completedTasks.reduce((sum, task) => {
        const creationDate = new Date(task.creationDate);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - creationDate.getTime()) / (1000 * 60 * 60 * 24));
        return sum + diffDays;
      }, 0);
      averageCompletionTime = totalDays / completedTasks.length;
    }
    
    return {
      id: user.id || '',
      fullName: user.fullName,
      role,
      tasksCompleted,
      tasksApproved,
      tasksDenied,
      tasksInProgress,
      successRate: Math.round(successRate * 100) / 100,
      averageCompletionTime: Math.round(averageCompletionTime * 100) / 100,
      priorityTasksCompleted,
      totalTasks: tasks.length
    };
  }

  private calculateGeneralStatistics(allTasks: Order[]): void {
    this.generalStats.totalVolunteers = this.volunteers.length;
    this.generalStats.totalReviewers = this.reviewers.length;
    this.generalStats.totalTasks = allTasks.length;
    
    this.generalStats.completedTasks = allTasks.filter(task => task.status === 'Completada').length;
    this.generalStats.approvedTasks = allTasks.filter(task => task.status === 'Aprobada').length;
    this.generalStats.deniedTasks = allTasks.filter(task => task.status === 'Denegada').length;
    this.generalStats.inProgressTasks = allTasks.filter(task => 
      task.status === 'En Proceso' || task.status === 'En Revisión'
    ).length;
    
    const totalFinishedTasks = this.generalStats.completedTasks + this.generalStats.approvedTasks + this.generalStats.deniedTasks;
    const successfulTasks = this.generalStats.completedTasks + this.generalStats.approvedTasks;
    this.generalStats.overallSuccessRate = totalFinishedTasks > 0 ? Math.round((successfulTasks / totalFinishedTasks) * 100) : 0;
    
    const totalUsers = this.generalStats.totalVolunteers + this.generalStats.totalReviewers;
    this.generalStats.averageTasksPerUser = totalUsers > 0 ? Math.round((this.generalStats.totalTasks / totalUsers) * 100) / 100 : 0;
    
    this.generalStats.priorityTasksCompleted = allTasks.filter(task => 
      task.isPriority && (task.status === 'Completada' || task.status === 'Aprobada')
    ).length;
  }

  private initChart(): void {
    this.chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Distribución de Tareas por Estado'
        }
      }
    };
  }

  private updateChart(): void {
    this.chartData = {
      labels: ['Completadas', 'Aprobadas', 'En Progreso', 'Denegadas'],
      datasets: [
        {
          data: [
            this.generalStats.completedTasks,
            this.generalStats.approvedTasks,
            this.generalStats.inProgressTasks,
            this.generalStats.deniedTasks
          ],
          backgroundColor: [
            '#10B981', // Verde para completadas
            '#059669', // Verde oscuro para aprobadas
            '#F59E0B', // Amarillo para en progreso
            '#EF4444'  // Rojo para denegadas
          ],
          borderWidth: 1
        }
      ]
    };
  }

  getSuccessRateSeverity(rate: number): string {
    if (rate >= 90) return 'success';
    if (rate >= 70) return 'info';
    if (rate >= 50) return 'warning';
    return 'danger';
  }

  refreshStats(): void {
    this.loadGeneralStats();
  }

  exportData(): void {
    // Implementar exportación de datos si es necesario
    console.log('Exportar datos de estadísticas');
  }
}
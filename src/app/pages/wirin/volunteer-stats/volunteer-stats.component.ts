import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';
import { OrderService } from '../../../services/order/order.service';
import { UserService } from '../../../services/user/user.service';
import { AuthService } from '../../../services/auth/auth.service';
import { Order } from '../../../types/order.interface';
import { User } from '../../../types/user.interface';
import { OrderStatus } from '../../../types/orderStatus.type';

interface VolunteerStats {
  totalTasks: number;
  completedTasks: number;
  approvedTasks: number;
  deniedTasks: number;
  inProgressTasks: number;
  successRate: number;
  priorityTasks: number;
  averageCompletionTime: number;
}

@Component({
  selector: 'app-volunteer-stats',
  standalone: true,
  imports: [CommonModule, CardModule, ProgressBarModule, ChartModule, TagModule],
  templateUrl: './volunteer-stats.component.html',
  styleUrls: ['./volunteer-stats.component.scss']
})
export class VolunteerStatsComponent implements OnInit {
  stats: VolunteerStats = {
    totalTasks: 0,
    completedTasks: 0,
    approvedTasks: 0,
    deniedTasks: 0,
    inProgressTasks: 0,
    successRate: 0,
    priorityTasks: 0,
    averageCompletionTime: 0
  };

  chartData: any;
  chartOptions: any;
  loading = true;
  error: string | null = null;
  currentUser: User | null = null;

  constructor(
    private orderService: OrderService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadVolunteerStats();
    this.initChart();
  }

  private async loadVolunteerStats() {
    try {
      this.loading = true;
      this.error = null;

      // Obtener el usuario actual
      const currentUserId = this.authService.getUserId();
      if (!currentUserId) {
        this.error = 'No se pudo obtener la información del usuario actual';
        return;
      }

      // Obtener información del usuario
      this.currentUser = await this.userService.getUserById(currentUserId).toPromise();

      // Obtener todas las órdenes
      const orders = await this.orderService.getOrders().toPromise();
      
      if (!orders) {
        this.error = 'No se pudieron cargar las tareas';
        return;
      }

      // Filtrar tareas del voluntario actual
      const volunteerTasks = orders.filter((order: Order) => 
        order.voluntarioId === currentUserId || 
        order.assignedUserId === currentUserId
      );

      this.calculateStats(volunteerTasks);
      this.updateChart();

    } catch (error) {
      console.error('Error loading volunteer stats:', error);
      this.error = 'Error al cargar las estadísticas';
    } finally {
      this.loading = false;
    }
  }

  private calculateStats(tasks: Order[]) {
    this.stats.totalTasks = tasks.length;
    this.stats.completedTasks = tasks.filter(task => task.status === 'Completada').length;
    this.stats.approvedTasks = tasks.filter(task => task.status === 'Aprobada').length;
    this.stats.deniedTasks = tasks.filter(task => task.status === 'Denegada').length;
    this.stats.inProgressTasks = tasks.filter(task => 
      task.status === 'En Proceso' || task.status === 'En Revisión'
    ).length;

    // Calcular tasa de éxito
    const totalFinishedTasks = this.stats.completedTasks + this.stats.approvedTasks + this.stats.deniedTasks;
    const successfulTasks = this.stats.completedTasks + this.stats.approvedTasks;
    if (totalFinishedTasks > 0) {
      this.stats.successRate = Math.round((successfulTasks / totalFinishedTasks) * 100);
    }

    // Calcular tareas prioritarias completadas exitosamente
    this.stats.priorityTasks = tasks.filter(task => 
      task.isPriority && (task.status === 'Completada' || task.status === 'Aprobada')
    ).length;

    // Calcular tiempo promedio de finalización
    const completedTasks = tasks.filter(task => 
      task.status === 'Completada' || task.status === 'Aprobada'
    );
    if (completedTasks.length > 0) {
      const totalDays = completedTasks.reduce((sum, task) => {
        const creationDate = new Date(task.creationDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - creationDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return sum + diffDays;
      }, 0);
      this.stats.averageCompletionTime = Math.round(totalDays / completedTasks.length);
    }
  }

  private initChart() {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    };
  }

  private updateChart() {
    this.chartData = {
      labels: ['Aprobadas', 'Completadas', 'En Progreso', 'Denegadas'],
      datasets: [
        {
          data: [
            this.stats.approvedTasks,
            this.stats.completedTasks - this.stats.approvedTasks,
            this.stats.inProgressTasks,
            this.stats.deniedTasks
          ],
          backgroundColor: [
            '#4CAF50',
            '#2196F3',
            '#FF9800',
            '#F44336'
          ],
          borderWidth: 0
        }
      ]
    };
  }

  getSuccessRateColor(): string {
    if (this.stats.successRate >= 80) return 'success';
    if (this.stats.successRate >= 60) return 'warning';
    return 'danger';
  }

  getSuccessRateSeverity(): 'success' | 'warning' | 'danger' {
    if (this.stats.successRate >= 80) return 'success';
    if (this.stats.successRate >= 60) return 'warning';
    return 'danger';
  }
}
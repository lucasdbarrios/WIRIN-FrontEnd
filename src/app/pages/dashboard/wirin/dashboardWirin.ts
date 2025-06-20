import { Component, OnInit, OnDestroy } from '@angular/core';
import { Order } from '../../../types/order.interface';
import { OrderService } from '../../../services/order/order.service';
import { WirinStatsWidget } from './components/statsWidgetWirin/statswidget';
import { RecentSalesWidgetWirin } from './components/recentSalesWidgetWirin/recentsaleswidget';
import { ChartModule } from 'primeng/chart';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-dashboard-wirin',
    imports: [WirinStatsWidget, RecentSalesWidgetWirin, ChartModule ],
    template: `
        <div class="grid grid-cols-12 gap-8">
            <app-stats-widget-wirin class="contents" [tasks]="tasks" />
            <div class="col-span-12 xl:col-span-6">
                <app-recent-sales-widget-wirin />
            </div>      
            <div class="col-span-12 xl:col-span-6">
            <div class="card">
                    <div class="font-semibold text-xl mb-4">Bibliografias entregadas</div>
                    <p-chart type="bar" [data]="barData" [options]="barOptions"></p-chart>
                </div>
            </div>         
        </div>
    `
})
export class DashboardWirin implements OnInit, OnDestroy {
    tasks: Order[] = [];
    taskPend: number = 0;
    completedTasks: number = 0;
    barData: any;
    barOptions: any;
    pieData: any;
    pieOptions: any;
    lineData: any;
    lineOptions: any;
    polarData: any;
    polarOptions: any;
    radarData: any;
    radarOptions: any;

    ngAfterViewInit() {
        this.initCharts();
    }

    // Suscripciones para gestionar la limpieza al destruir el componente
    private subscriptions: Subscription[] = [];
    
    constructor(private orderService: OrderService){}

    initCharts() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.barData = {
            labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio'],
            datasets: [
                {
                    label: 'Bibliografia entregada',
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                    borderColor: documentStyle.getPropertyValue('--p-primary-500'),
                    data: [65, 59, 80, 81, 56, 55, 40]
                },
                {
                    label: 'Bibliografia adaptada',
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
                    borderColor: documentStyle.getPropertyValue('--p-primary-200'),
                    data: [28, 48, 40, 19, 86, 27, 90]
                }
            ]
        };

        this.barOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary,
                        font: {
                            weight: 500
                        }
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };

        this.pieData = {
            labels: ['A', 'B', 'C'],
            datasets: [
                {
                    data: [540, 325, 702],
                    backgroundColor: [documentStyle.getPropertyValue('--p-indigo-500'), documentStyle.getPropertyValue('--p-purple-500'), documentStyle.getPropertyValue('--p-teal-500')],
                    hoverBackgroundColor: [documentStyle.getPropertyValue('--p-indigo-400'), documentStyle.getPropertyValue('--p-purple-400'), documentStyle.getPropertyValue('--p-teal-400')]
                }
            ]
        };

        this.pieOptions = {
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        color: textColor
                    }
                }
            }
        };

        this.lineData = {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [
                {
                    label: 'First Dataset',
                    data: [65, 59, 80, 81, 56, 55, 40],
                    fill: false,
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                    borderColor: documentStyle.getPropertyValue('--p-primary-500'),
                    tension: 0.4
                },
                {
                    label: 'Second Dataset',
                    data: [28, 48, 40, 19, 86, 27, 90],
                    fill: false,
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
                    borderColor: documentStyle.getPropertyValue('--p-primary-200'),
                    tension: 0.4
                }
            ]
        };

        this.lineOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };

        this.polarData = {
            datasets: [
                {
                    data: [11, 16, 7, 3],
                    backgroundColor: [documentStyle.getPropertyValue('--p-indigo-500'), documentStyle.getPropertyValue('--p-purple-500'), documentStyle.getPropertyValue('--p-teal-500'), documentStyle.getPropertyValue('--p-orange-500')],
                    label: 'My dataset'
                }
            ],
            labels: ['Indigo', 'Purple', 'Teal', 'Orange']
        };

        this.polarOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                r: {
                    grid: {
                        color: surfaceBorder,
                    },
                    ticks: {
                        display: false,
                        color: textColorSecondary
                    },
                },
            },
        };

        this.radarData = {
            labels: ['Eating', 'Drinking', 'Sleeping', 'Designing', 'Coding', 'Cycling', 'Running'],
            datasets: [
                {
                    label: 'My First dataset',
                    borderColor: documentStyle.getPropertyValue('--p-indigo-400'),
                    pointBackgroundColor: documentStyle.getPropertyValue('--p-indigo-400'),
                    pointBorderColor: documentStyle.getPropertyValue('--p-indigo-400'),
                    pointHoverBackgroundColor: textColor,
                    pointHoverBorderColor: documentStyle.getPropertyValue('--p-indigo-400'),
                    data: [65, 59, 90, 81, 56, 55, 40]
                },
                {
                    label: 'My Second dataset',
                    borderColor: documentStyle.getPropertyValue('--p-purple-400'),
                    pointBackgroundColor: documentStyle.getPropertyValue('--p-purple-400'),
                    pointBorderColor: documentStyle.getPropertyValue('--p-purple-400'),
                    pointHoverBackgroundColor: textColor,
                    pointHoverBorderColor: documentStyle.getPropertyValue('--p-purple-400'),
                    data: [28, 48, 40, 19, 96, 27, 100]
                }
            ]
        };

        this.radarOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                r: {
                    pointLabels: {
                        color: textColor
                    },
                    grid: {
                        color: surfaceBorder
                    }
                }
            }
        };
    }
   
    ngOnInit(): void {
        this.taskPend = this.tasks.filter(t => t.status != "Pendiente").length;
        this.completedTasks = this.tasks.filter(t => t.status === "Completada").length;
    
        this.loadOrdersWithAutoRefresh();
    }
    
    ngOnDestroy(): void {
        // Cancelar todas las suscripciones al destruir el componente
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
    
    // Método original para cargar órdenes (se mantiene para compatibilidad)
    loadOrders(): void {
        this.orderService.getOrders().subscribe({
            next: (orders) => {
                this.tasks = orders;
                this.updateTaskCounts();
            },
            error: (error) => {
                console.error('Error fetching tasks:', error);
            }
        });
    }
    
    // Nuevo método que utiliza auto-refresh para actualizar las órdenes cada minuto
    loadOrdersWithAutoRefresh(): void {
        const subscription = this.orderService.getOrdersWithAutoRefresh().subscribe({
            next: (orders) => {
                this.tasks = orders;
                this.updateTaskCounts();
            },
            error: (error) => {
                console.error('Error fetching tasks:', error);
            }
        });
        
        this.subscriptions.push(subscription);
    }
    
    // Método para actualizar los contadores de tareas
    private updateTaskCounts(): void {
        this.taskPend = this.tasks.filter(t => t.status != "Pendiente").length;
        this.completedTasks = this.tasks.filter(t => t.status === "Completada").length;
    }

}


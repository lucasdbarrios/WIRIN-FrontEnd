import { Component, OnInit } from '@angular/core';
import { RecentSalesWidget } from '../components/recentsaleswidget';
import { Order } from '../../../types/order.interface';
import { OrderService } from '../../../services/order.service';
import { WirinStatsWidget } from './components/statsWidgetWirin/statswidget';


@Component({
    selector: 'app-dashboard-wirin',
    imports: [WirinStatsWidget, RecentSalesWidget ],
    template: `
        <div class="grid grid-cols-12 gap-8">
            <app-stats-widget-wirin class="contents" [tasks]="tasks" />
            <div class="col-span-12 xl:col-span-6">
                <app-recent-sales-widget />
               
            </div>
            <div class="col-span-12 xl:col-span-6">
                <!-- <app-form />  -->
            </div>
            
        </div>
    `
})
export class DashboardWirin implements OnInit{
    tasks: Order[] = [];
    taskPend: number = 0;
    completedTasks: number = 0;
    constructor(private orderService: OrderService){}
    ngOnInit(): void {
        this.taskPend = this.tasks.filter(t => t.status != "Pendiente").length;
        this.completedTasks = this.tasks.filter(t => t.status === "Completada").length;
        this.orderService.getOrders().subscribe({
            next: (orders) => {
                this.tasks = orders;
            },
            error: (error) => {
                console.error('Error fetching tasks:', error);
            }
        });  
    }

}


import { Component } from '@angular/core';
import { StatsWidget } from '../components/statswidget';
import { RecentSalesWidget } from '../components/recentsaleswidget';
import { ApiService } from '../../../services/api.service';
import { TaskFormComponent } from '../../wirin/form/form';


@Component({
    selector: 'app-dashboard-wirin',
    imports: [StatsWidget, RecentSalesWidget ],
    template: `
        <div class="grid grid-cols-12 gap-8">
            <app-stats-widget class="contents" />
            <div class="col-span-12 xl:col-span-6">
                <app-recent-sales-widget />
               
            </div>
            <div class="col-span-12 xl:col-span-6">
                <!-- <app-form />  -->
            </div>
            
        </div>
    `
})
export class DashboardWirin {
    tasks: any[] = [];
    constructor(private apiService: ApiService) {
        this.apiService.get('/order').subscribe((data: any) => {
            this.tasks = data;
        });
     }
}

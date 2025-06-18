import { Component, Input, ChangeDetectorRef, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { OrderDelivery } from '../../../../types/orderDelivery.interface';

@Component({
    selector: 'app-chart-tasks',
    templateUrl: './chart-tasks.component.html',
    standalone: true,
    imports: [ChartModule]
})
export class ChartTasksComponent implements AfterViewInit, OnChanges {
    @Input() projects: OrderDelivery[] = [];
    barData: any;
    barOptions: any;

    constructor(private cdRef: ChangeDetectorRef) {}

    ngAfterViewInit() {
        this.initCharts();
        this.cdRef.detectChanges(); // Fuerza la actualización de la vista después de inicializar el gráfico
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['projects']) {
            this.initCharts();
            this.cdRef.detectChanges(); // Detecta cambios cuando `projects` cambia
        }
    }

    initCharts() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
        const deliveredByMonth = Array(12).fill(0);
        const pendingByMonth = Array(12).fill(0);
        
        this.projects.forEach(project => {
            const monthIndex = new Date(project.deliveryDate).getMonth();
            if (project.status === "Entregado") {
                deliveredByMonth[monthIndex]++;
            } else if (project.status !== "Entregado") {
                pendingByMonth[monthIndex]++;
            }
        });
        
        this.barData = {
            labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            datasets: [
                {
                    label: `Bibliografía entregada (${deliveredByMonth.reduce((a, b) => a + b, 0)})`,
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-500'),
                    borderColor: documentStyle.getPropertyValue('--p-primary-500'),
                    data: deliveredByMonth
                },
                {
                    label: `Bibliografía creada (${pendingByMonth.reduce((a, b) => a + b, 0)})`,
                    backgroundColor: documentStyle.getPropertyValue('--p-primary-200'),
                    borderColor: documentStyle.getPropertyValue('--p-primary-200'),
                    data: pendingByMonth
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
    }
}
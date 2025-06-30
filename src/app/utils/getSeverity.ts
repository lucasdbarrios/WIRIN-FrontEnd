export const getSeverity = (state: string): string => {
    switch (state) {
        case 'En Proceso':
        case 'EN PROCESO':
            return 'help';
        case 'En Revisión':
        case 'EN REVISIÓN':
            return 'warn';
        case 'Completada':
        case 'COMPLETADA':
        case 'Aprobada':
        case 'APROBADA':
        case 'Entregado':
        case 'ENTREGADO':
            return 'success';
        case 'Denegada':
        case 'DENEGADA':
            return 'danger';
        default:
            return 'info';
    }
}
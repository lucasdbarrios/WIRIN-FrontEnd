export const getSeverity = (state: string): string => {
    switch (state) {
        case 'En Proceso':
            return 'help';
        case 'En Revisión':
            return 'warn';
        case 'Completada':
            return 'success';
        case 'Aprobada':
            return 'success';
        case 'Entregado':
            return 'success';
        case 'Denegada':
            return 'danger';
        default:
            return 'info';
    }
}
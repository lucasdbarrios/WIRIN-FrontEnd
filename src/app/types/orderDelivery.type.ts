export type OrderDelivery = {
    studentId: string;
    userId: string;
    deliveryDate: Date;
    status: string;
    id: number;
    orderQuantity?: number;
}
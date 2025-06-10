import { User } from "./user.interface";

export type OrderDelivery = {
    studentId: string;
    userId: string;
    deliveryDate: Date;
    status: string;
    id: number;
    orderQuantity?: number;
    user?: User;
}
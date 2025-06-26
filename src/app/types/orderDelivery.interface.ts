import { Order } from "./order.interface";
  
  export interface OrderDelivery {
    studentId: string;
    id: number;
    status: string;
    userId?: string;
    deliveryDate: string;
    createDate?: string;
    title: string;
    orders: Order[];
    userName?: string;
    studentUserName?: string;
  }
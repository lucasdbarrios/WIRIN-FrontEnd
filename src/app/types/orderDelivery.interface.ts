import { Order } from "./order.interface";
import { User } from "./user.interface";
  
  export interface OrderDelivery {
    studentId: string;
    id: number;
    status: string;
    userId: string;
    deliveryDate: string;
    title: string;
    orders: Order[];
    userName: string;
    studentUserName: string;
  }
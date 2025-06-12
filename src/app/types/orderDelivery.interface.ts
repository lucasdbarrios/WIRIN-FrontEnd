export interface Order {
    id: number;
    name: string;
    subject: string;
    description: string;
    authorName: string;
    rangePage: string;
    isPriority: boolean;
    status: string;
    creationDate: string;
    limitDate: string;
    createdByUserId: string;
    filePath: string;
    voluntarioId: string;
    alumnoId: string;
    revisorId: string;
    delivererId: number;
  }
  
  export interface OrderDelivery {
    studentId: string;
    id: number;
    status: string;
    userId: string;
    deliveryDate: string;
    title: string;
    orders: Order[];
  }
export interface User {
    id?: string;
    fullName: string;
    userName: string;
    email: string;
    phoneNumber: string;
    password?: string;
    roles: string[];
}
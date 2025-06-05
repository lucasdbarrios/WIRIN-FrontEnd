export interface ProcessParagraph {
    orderId: number;
    pageNumber: number;
    paragraphText: string;
    hasError: boolean;
    errorMessage: string;
}
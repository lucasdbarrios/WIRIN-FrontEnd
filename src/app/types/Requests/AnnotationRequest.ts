export interface AnnotationRequest {
    orderId: number;
    pageNumber: number;
    annotation: string;
    annotatorId?: string;
}
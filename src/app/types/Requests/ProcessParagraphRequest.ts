export type ProcessParagraphRequest = {
    orderId: number,
    paragraphText?: string,
    pageNumber: number,
    hasError: boolean,
    errorMessage: string
  }
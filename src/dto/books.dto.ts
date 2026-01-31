// dto/book.dto.ts
export interface BookDto {
    title: string;
    publicationYear?: number;
    author: string;
    publisher: string;
    quantity: number;
  }
export interface BookDetailsUpdateDto{
    isStocking: boolean;
    quantity: number;
  }
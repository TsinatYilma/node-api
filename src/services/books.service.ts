// services/books.service.ts
import mongoose from 'mongoose';
import { Book, BookDocument } from '../models/books.model'; // pure Node model
import { BookDto } from '../dto/books.dto';
import { BookDetailsUpdateDto } from '../dto/books.dto';

export class BooksService {
  private bookModel: mongoose.Model<BookDocument>;

  constructor() {
    this.bookModel = mongoose.model<BookDocument>('Book', Book.schema);
  }

  async addBook(dto: BookDto): Promise<BookDocument> {
    const createdBook = new this.bookModel(dto);
    return createdBook.save(); // Save the book to MongoDB
  }

  async getAllBooks(): Promise<BookDocument[]> {
    return this.bookModel.find().exec(); // Retrieve all books
  }

  async count(): Promise<number> {
    return this.bookModel.countDocuments();
  }

  async updateQuantity(
    id: string,
    dto: BookDetailsUpdateDto
  ): Promise<BookDocument> {
    const book = await this.bookModel.findById(id);

    if (!book) {
      throw new Error('Book not found');
    }

    if (dto.isStocking) {
      book.quantity += dto.quantity;
    } else {
      if (book.quantity - dto.quantity < 0) {
        throw new Error('Quantity cannot be less than zero');
      }
      book.quantity -= dto.quantity;
    }

    return book.save();
  }

  async removeBook(id: string): Promise<{ message: string }> {
    const result = await this.bookModel.findByIdAndDelete(id);

    if (!result) {
      throw new Error('Book not found');
    }

    return { message: 'Book successfully deleted' };
  }
}

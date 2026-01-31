// services/borrowedBooks.service.ts
import { BorrowedBook, BorrowedBookDocument } from '../models/borroweBooks.model';
import { Book, BookDocument, BookStatus } from '../models/books.model';
import mongoose from 'mongoose';

export const borrowedBooksService = {
  async borrowBook(dto: { bookId: string; User_email: string }) {
    const book = await Book.findById(dto.bookId).exec();
    if (!book) throw new Error('Book not found');

    if (book.quantity < 1) throw new Error('Book cannot be borrowed');

    book.quantity -= 1;
    book.status = book.quantity === 0 ? BookStatus.UNAVAILABLE : BookStatus.AVAILABLE;
    await book.save();

    const borrowedBook = new BorrowedBook({
      borrowerId: dto.User_email,
      bookId: dto.bookId,
      borrowedDate: new Date(),
    });
    await borrowedBook.save();

    return borrowedBook;
  },

  async getAllBorrowedBooks(borrowerId: string) {
    const borrowedBooks = await BorrowedBook.find({ borrowerId }).exec();
    if (borrowedBooks.length === 0) throw new Error('No borrowed books found for this user');

    const borrowedBooksWithDetails = [];
    for (const borrowedBook of borrowedBooks) {
      const book = await Book.findById(borrowedBook.bookId).exec();
      if (book) {
        borrowedBooksWithDetails.push({
          bookId: borrowedBook.bookId,
          borrowerId: borrowedBook.borrowerId,
          borrowedDate: borrowedBook.borrowedDate,
          title: book.title,
          author: book.author,
          publisher: book.publisher,
          publicationYear: book.publicationYear,
        });
      }
    }

    return borrowedBooksWithDetails;
  },

  async count() {
    return BorrowedBook.countDocuments();
  },

  async returnBook(id: string) {
    const borrowedBook = await BorrowedBook.findById(id).exec();
    if (!borrowedBook) throw new Error('Borrowed book record not found');

    const book = await Book.findById(borrowedBook.bookId).exec();
    if (!book) throw new Error('Book not found');

    book.quantity += 1;
    book.status = BookStatus.AVAILABLE;
    await book.save();

    await BorrowedBook.findByIdAndDelete(id).exec();

    return { message: 'Book returned successfully' };
  },

  async removeBorrowedBookByDelete(borrowerEmail: string, bookId: string) {
    const result = await BorrowedBook.deleteMany({ borrowerId: borrowerEmail, bookId });
    return { deletedCount: result.deletedCount };
  },

  async returnAllBooks(borrowerId: string) {
    const borrowedBooks = await BorrowedBook.find({ borrowerId }).exec();
    if (borrowedBooks.length === 0) throw new Error('No borrowed books found for this user');

    for (const borrowedBook of borrowedBooks) {
      const book = await Book.findById(borrowedBook.bookId).exec();
      if (book) {
        book.quantity += 1;
        book.status = BookStatus.AVAILABLE;
        await book.save();
      }
    }

    await BorrowedBook.deleteMany({ borrowerId }).exec();
    return { message: 'All books returned successfully' };
  },

  async removeBorrowedBook(borrowerEmail: string, bookId: string) {
    const result = await BorrowedBook.deleteOne({ borrowerId: borrowerEmail, bookId });
    if (result.deletedCount === 0) throw new Error('No borrowed book found for this user');

    return { message: 'Book removed from borrowed list successfully' };
  },
};

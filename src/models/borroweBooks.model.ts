
import mongoose, { Schema, Document, Model } from 'mongoose';

export type BorrowedBookDocument = Document & {
  borrowerId: string;
  bookId: string;
  borrowedDate: Date;
};

const BorrowedBookSchema: Schema<BorrowedBookDocument> = new Schema(
  {
    borrowerId: { type: String, required: true, trim: true },
    bookId: { type: String, required: true, trim: true },
    borrowedDate: { type: Date, required: true, default: () => new Date() },
  },
  { timestamps: true } // creates createdAt and updatedAt automatically
);

export const BorrowedBook: Model<BorrowedBookDocument> =
  mongoose.model<BorrowedBookDocument>('BorrowedBook', BorrowedBookSchema);

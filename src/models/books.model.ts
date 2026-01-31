import mongoose, { Schema, Document } from 'mongoose';

export enum BookStatus {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
}

export type BookDocument = Document & {
  title: string;
  publicationYear: number;
  author: string;
  publisher: string;
  quantity: number;
  status: BookStatus;
};

const BookSchema: Schema<BookDocument> = new Schema(
  {
    title: { type: String, required: true, trim: true },

    publicationYear: {
      type: Number,
      required: true,
      min: 1000,
      max: new Date().getFullYear(),
    },

    author: { type: String, required: true, trim: true },

    publisher: { type: String, required: true, trim: true },

    quantity: { type: Number, required: true, min: 0, default: 0 },

    status: {
      type: String,
      enum: Object.values(BookStatus),
      default: BookStatus.AVAILABLE,
    },
  },
  { timestamps: true } // createdAt, updatedAt
);

export const Book = mongoose.model<BookDocument>('Book', BookSchema);

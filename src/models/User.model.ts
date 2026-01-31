// models/User.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

// Define user roles
export type Role = 'admin' | 'user';

// Define the interface for a User document
export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  role: Role;
  createdAt?: Date;
  updatedAt?: Date;
}

// Create the User schema
const UserSchema= new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true, // remove extra spaces
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // store emails in lowercase
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['admin', 'user'],
      required: true,
      default: 'user',
    },
  },
  { timestamps: true } // auto add createdAt and updatedAt
);

// Export the model
export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);


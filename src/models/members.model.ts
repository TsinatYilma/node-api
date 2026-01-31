import { Schema, model, Document } from 'mongoose';

export interface MemberDocument extends Document {
  fullName: string;
  email: string;
  phone: string;
  role: 'student' | 'faculty' | 'staff';
  status: 'active' | 'inactive';
}

const memberSchema = new Schema<MemberDocument>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ['student', 'faculty', 'staff'],
      required: true,
    },

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);
const  Member = model<MemberDocument>('Member', memberSchema);
export default Member;
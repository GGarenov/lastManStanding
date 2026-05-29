import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'user' }, // 'user' | 'admin'
    balance: { type: Number, default: 50 },
  },
  { timestamps: true },
);

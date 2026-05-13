import * as mongoose from 'mongoose';

export const UserSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [30, 'Username must be at most 30 characters long'],
      match: [
        /^[a-zA-Z0-9_-]+$/,
        'Username can only contain letters, numbers, underscores, and hyphens',
      ],
    },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'user' }, // 'user' | 'admin'
    balance: { type: Number, default: 50 },
  },
  { timestamps: true },
);

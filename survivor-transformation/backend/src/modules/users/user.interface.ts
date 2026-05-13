import { Document } from 'mongoose';

export interface User extends Document {
  email: string;
  username: string;
  passwordHash: string;
  role: 'user' | 'admin';
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

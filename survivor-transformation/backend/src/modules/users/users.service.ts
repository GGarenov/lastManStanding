import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { USERS_MODEL } from './users.providers';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_MODEL)
    private readonly userModel: Model<any>,
  ) {}

  findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  findByUsername(username: string) {
    return this.userModel.findOne({ username });
  }

  findById(userId: string) {
    return this.userModel.findById(userId);
  }

  findAll() {
    // exclude password hashes when returning users
    return this.userModel.find().select('-passwordHash');
  }

  create(data: any) {
    return this.userModel.create(data);
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userModel.findByIdAndDelete(userId);
  }

  async countAdmins(): Promise<number> {
    return this.userModel.countDocuments({ role: 'admin' });
  }

  findRegisteredPublic() {
    return this.userModel
      .find({ role: { $ne: 'admin' } })
      .select('firstName lastName -_id')
      .sort({ createdAt: 1 })
      .lean();
  }
}

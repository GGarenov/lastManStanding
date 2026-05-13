import * as mongoose from 'mongoose';

export const PoolParticipantSchema = new mongoose.Schema(
  {
    poolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pool',
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'winner'],
      default: 'pending',
    },

    joinedAt: {
      type: Date,
      default: Date.now,
    },

    approvedAt: {
      type: Date,
    },

    eliminated: {
      type: Boolean,
      default: false,
    },

    eliminatedAt: {
      type: Date,
    },

    eliminatedReason: {
      type: String,
      enum: ['team_lost', 'no_pick'],
    },

    winnerAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

PoolParticipantSchema.index({ poolId: 1, userId: 1 }, { unique: true });
PoolParticipantSchema.index({ poolId: 1, status: 1 });

import * as mongoose from 'mongoose';

export const PoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ['open', 'active', 'finished'],
      default: 'open',
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    startedAt: {
      type: Date,
    },

    finishedAt: {
      type: Date,
    },

    description: {
      type: String,
      trim: true,
    },

    tournamentKey: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

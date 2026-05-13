import * as mongoose from 'mongoose';
import { MatchSchema } from './match.schema';

export const RoundSchema = new mongoose.Schema(
  {
    poolId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    roundNumber: {
      type: Number,
      required: true,
    },

    matches: {
      type: [MatchSchema],
      required: true,
    },

    isClosed: {
      type: Boolean,
      default: false,
    },

    pickDeadline: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true },
);

RoundSchema.index({ poolId: 1, roundNumber: 1 }, { unique: true });

import * as mongoose from 'mongoose';

export const PickSchema = new mongoose.Schema(
  {
    poolId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    round: {
      type: Number,
      required: true,
    },

    team: {
      type: String,
      required: true,
    },

    eliminated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// ❌ Един pick на user за рунд в даден pool
PickSchema.index({ poolId: 1, userId: 1, round: 1 }, { unique: true });

// ❌ Един и същи отбор не може да се използва два пъти в pool
PickSchema.index({ poolId: 1, userId: 1, team: 1 }, { unique: true });

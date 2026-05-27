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

    prizePoolEur: {
      type: Number,
    },

    /** Set when pool is started and rake is enabled: approvedCount * RAKE_PER_ENTRY_EUR (house earnings). */
    rakeEur: {
      type: Number,
    },

    /** Entry fee in EUR used for this pool (e.g. 50) for reporting and display consistency. */
    entryFeeEur: {
      type: Number,
    },

    /** Rake in EUR per entry; set at pool creation. Prize per entry = entryFeeEur - rakePerEntryEur. */
    rakePerEntryEur: {
      type: Number,
    },
  },
  { timestamps: true },
);

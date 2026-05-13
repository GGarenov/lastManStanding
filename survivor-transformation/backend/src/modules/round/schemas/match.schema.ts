import * as mongoose from 'mongoose';

export const MatchSchema = new mongoose.Schema(
  {
    homeTeam: {
      type: String,
      required: true,
      trim: true,
    },

    awayTeam: {
      type: String,
      required: true,
      trim: true,
    },

    winnerTeam: {
      type: String,
      trim: true,
      default: null,
    },

    isDraw: {
      type: Boolean,
      default: false,
    },

    homeGoals: {
      type: Number,
      default: null,
    },
    awayGoals: {
      type: Number,
      default: null,
    },
  },
  {
    _id: false,
  },
);

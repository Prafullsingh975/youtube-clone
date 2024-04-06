import mongoose, { Schema } from "mongoose";

const communitySchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const CommunityPost = mongoose.model("CommunityPost", communitySchema);

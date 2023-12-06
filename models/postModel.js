import mongoose from "mongoose";
const postSchema = new mongoose.Schema(
  {
    postImages: [
      {
        public_id: {
          type: String,
        },
        url: {
          type: String,
        },
      },
    ],
    title: {
      type: String,
      required: [true, "Please Add Post Title!"],
    },
    name: {
      type: String,
      required: [true, "Please Add Post Title!"],
    },
    make: {
      type: String,
    },
    model: {
      type: String,
    },
    variant: {
      type: String,
    },
    area: {
      type: String,
    },
    floor: {
      type: String,
    },
    room: {
      type: String,
    },
    rent: {
      type: String,
      required: [true, "Please Add Rent!"],
    },
    description: {
      type: String,
      required: [true, "Please Add Post Description!"],
    },
    postedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "Users",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);
export const postMdoel = mongoose.model("Post", postSchema);
export default postMdoel;

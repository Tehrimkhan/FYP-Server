import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is Required!"],
    },
    email: {
      type: String,
      required: [true, "Email is Required!"],
      unique: [true, "Email already Registered!"],
    },
    password: {
      type: String,
      required: [true, "Password is Required!"],
      minLength: [6, "Password should be greater then 6 characters!"],
    },
    confirmPassword: {
      type: String,
      required: [true, "Password is not Same!"],
      minLength: [6, "Password should be greater then 6 characters!"],
    },
    profileImage: [
      {
        // type: String,
        public_id: String,
        url: String,
      },
    ],
    imgpath: {
      type: String,
    },
    role: {
      type: String,
      default: "Users",
    },
  },
  { timestamps: true }
);
//functions
// hash func
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

// compare function
userSchema.methods.comparePassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

//JWT TOKEN
userSchema.methods.generateToken = function () {
  return JWT.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const userMdoel = mongoose.model("Users", userSchema);
export default userMdoel;

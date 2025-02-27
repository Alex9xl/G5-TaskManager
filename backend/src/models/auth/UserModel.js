import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
    },

    email: {
      type: String,
      required: [true, "Please an email"],
      unique: true,
      trim: true,
      match: [
        /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
        "Please add a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add password!"],
    },

    photo: {
      type: String,
      default: "https://avatars.githubusercontent.com/u/19819005?v=4",
    },

    bio: {
      type: String,
      default: "I am a new user.",
    },

    role: {
      type: String,
      enum: ["user", "admin", "creator"],
      default: "user",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, minimize: true }
);

// hashear la contraseña antes de guardar
UserSchema.pre("save", async function (next) {
  // comprobar si la contraseña no ha sido modificada
  if (!this.isModified("password")) {
    return next();
  }

  // hashear la contraseña  ==> bcrypt
  // generar salt
  const salt = await bcrypt.genSalt(10);
  // hashear la contraseña con la salt
  const hashedPassword = await bcrypt.hash(this.password, salt);
  // Establezca la contraseña en la contraseña hasheada
  this.password = hashedPassword;

  // Llama al siguiente middleware
  next();
});

const User = mongoose.model("User", UserSchema);

export default User;

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  Location: String,
});

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;

import express from "express";
import User from "../models/User.js";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import 'dotenv/config';
const userRoutes = express.Router();
console.log(process.env.TOKEN_SECRET);

//TODO: redefine expiresIn
const genToken = (id) => {
  return jwt.sign({ id }, process.env.TOKEN_SECRET, { expiresIn: "60d" });
};

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPasswords(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: genToken(user._id),
      createdAt: user.createdAt,
    });
  } else {
    res.status(401).send("Invalid Email or Password");
    throw new Error("User not found.");
  }
});

// POST register user
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400).send("We already have an account with that email address.");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: genToken(user._id),
      createdAt: user.createdAt,
    });
  } else {
    res.status(400).send("We could not register you.");
    throw new Error(
      "Something went wrong. Please check your data and try again."
    );
  }
});

userRoutes.route("/login").post(loginUser);
userRoutes.route("/register").post(registerUser);

export default userRoutes;

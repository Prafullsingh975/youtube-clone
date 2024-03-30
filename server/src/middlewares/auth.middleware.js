import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const isLoggedIn = asyncHandler(async (req, _, next) => {
  try {
    // Searching for access token
    const token =
      req.cookies?.accessToken || req.headers["Authorization"].split(" ")[0];
    if (!token) throw new ApiError(403, "Token not found");

    // Verifying access token
    const { id } = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // finding logged in user from db
    const user = await User.findById(id).select("-password -refreshToken");
    if (!user) throw new ApiError(403, "User not found");

    // Attaching user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in isLoggedIn middleware");
    throw new Error(500, error.message || "Error in isLoggedIn middleware");
  }
});

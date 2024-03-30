import { User } from "../models/user.model.js";
import { ApiError } from "./apiError.js";

export const generateAccessTokenAndRefreshToken = async (id) => {
  try {
    // Finding user
    const user = await User.findById(id);

    // generating access token and refresh token using user method
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // saving refresh token to db
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // returning access token and refresh token
    return { accessToken, refreshToken };
  } catch (error) {
    console.log("Error in generating access token and refresh token: ", error);
    throw new ApiError(
      500,
      "Error in generating access token and refresh token"
    );
  }
};

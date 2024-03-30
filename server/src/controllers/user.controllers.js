import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cloudinaryUploader } from "../utils/cloudinary.js";
import {
  changePasswordValidator,
  registerUserValidator,
  updateUSerDetailValidator,
} from "../validators/user.validator.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAccessTokenAndRefreshToken } from "../utils/generateTokens.js";
import jwt from "jsonwebtoken";

export const registerUser = asyncHandler(async (req, res) => {
  const { success, error } = registerUserValidator.safeParse(req.body);

  //   Validating check
  if (!success) return res.status(400).json({ success, errors: error.errors });

  //   Getting data from frontend
  const { fullName, email, password } = req.body;

  // Checking user on the basis of email
  const isUser = await User.findOne({
    $or: [{ email }, { userName: email.split("@")[0] }],
  });
  if (isUser) throw new ApiError(409, "Email or username already exists.");

  //   Checking for files
  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required");

  //   Upload image to cloudinary
  const avatar = await cloudinaryUploader(avatarLocalPath);
  const coverImage = await cloudinaryUploader(coverImageLocalPath);

  if (!avatar) throw new ApiError(400, "Avatar file is required");

  //   creating new user to database
  const newUser = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: "generated automatically before saving",
  });

  if (!newUser) throw new ApiError(500, "Error in user registration");

  // Creating a new user object
  const registerUser = { ...newUser.toObject() };

  // Delete password,refreshToken from newUser
  delete registerUser.password;
  delete registerUser.refreshToken;

  return res
    .status(201)
    .json(new ApiResponse(201, registerUser, "User registered successful"));
});

export const loginUser = asyncHandler(async (req, res) => {
  // Validate the fields
  const { success, error } = registerUserValidator.safeParse(req.body);

  //   Validating check
  if (!success) return res.status(400).json({ success, errors: error.errors });

  //   Getting data from frontend server
  const { email, password } = req.body;

  //   Finding user on the basis of email
  const user = await User.findOne({ email });

  if (!user) throw new ApiError(404, "User not found");

  //   Checking password using user method
  const isMatch = await user.isCorrectPassword(password);

  if (!isMatch) throw new ApiError(401, "Invalid credentials");

  // Creating tokens
  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  // Creating loggedInUser objects
  const loggedInUser = {
    ...user.toObject(),
    accessToken: accessToken,
    refreshToken: refreshToken,
  };

  // Deleting password from response
  delete loggedInUser.password;

  // Creating secure cookies option
  const options = {
    // expires: new Date(Date.now() + 3600000 * 24 * 30),
    httpOnly: true,
    secure: true,
  };

  // Setting cookies in response header
  return res
    .status(200)
    .cookies("accessToken", accessToken, options)
    .cookies("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, loggedInUser, "User logged in successful"));
});

export const logoutUser = asyncHandler(async (req, res) => {
  // Getting logged in user from DB and removing refresh token from it
  await User.findByIdAndUpdate(req.user._id, {
    $unset: {
      refreshToken: 1, //remove the field from document
    },
  });

  // cookies options
  const options = {
    httpOnly: true,
    secure: true,
  };

  // clearing cookies from req headers and sending response
  res
    .status(200)
    .clearCookies(accessToken, options)
    .clearCookies("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

export const getLoggedInUser = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, req.user, "Successfully fetch logged in user"));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  // Getting refresh token from frontend
  const comingRefreshToken =
    req.cookies?.refreshToken ||
    req.headers["Authorization"] ||
    req.body.refreshToken;
  // Checking for token
  if (!comingRefreshToken) throw new ApiError(404, "Token not found");
  try {
    // Verifying refresh token
    const { id } = await jwt.verify(
      comingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(id).select("-password");

    if (!user) throw new ApiError(403, "Invalid token");

    // comparing comingRefreshToken and user Refresh token
    if (comingRefreshToken !== user.refreshToken)
      throw new ApiError(403, "Token not match");

    const { refreshToken, accessToken } =
      await generateAccessTokenAndRefreshToken(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookies("accessToken", accessToken, options)
      .cookies("refreshToken", refreshAccessToken, options)
      .json(
        new ApiResponse(
          200,
          { ...user, refreshToken, accessToken },
          "Tokens refreshed successfully"
        )
      );
  } catch (error) {
    console.error("Error in generating new refresh token ", error);
    throw new ApiError(
      500,
      `Error in generating new refresh token ${error.message}`
    );
  }
});

export const changePassword = asyncHandler(async (req, res) => {
  // Validation
  const { success } = changePasswordValidator.safeParse(req.body);
  if (!success) throw new ApiError(411, "Invalid data");

  // Getting data from frontend
  const { password, newPassword } = req.body;

  // Compare new password and old password
  if (password == newPassword) throw new ApiError(400, "Same password");

  // Getting user from db
  const user = await User.findById(req.user.id);

  // Checking password
  const isMatch = user.isCorrectPassword(password);
  if (!isMatch) throw new ApiError(403, "Invalid Credentials");

  // Update password
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  // Converting user to JavaScript Object
  const loggedInUser = { ...user.toObject() };

  // removing password and refreshToken
  delete loggedInUser.password;
  delete loggedInUser.refreshToken;

  return res
    .status(202)
    .json(new ApiResponse(202, loggedInUser, "Password Change Successfully"));
});

export const updateUserDetails = asyncHandler(async (req, res) => {
  // Validation
  const { success } = updateUSerDetailValidator.safeParse(req.body);
  if (!success) throw new ApiError(411, "Invalid data");

  // Getting data from frontend
  const { fullName } = req.body;

  // getting loggedIn user from DB
  const loggedInUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      $set: {
        fullName,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  res
    .status(202)
    .json(
      new ApiResponse(202, loggedInUser, "User details update successfully")
    );
});

export const updateAvatar = asyncHandler(async (req, res) => {});

export const updateCoverImage = asyncHandler(async (req, res) => {});

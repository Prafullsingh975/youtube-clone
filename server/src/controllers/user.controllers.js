import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cloudinaryUploader } from "../utils/cloudinary.js";
import { registerUserValidator } from "../validators/user.validator.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { success, error } = registerUserValidator.safeParse(req.body);

  //   Validating check
  if (!success) return res.status(400).json({ success, errors: error.errors });

  //   Getting data from frontend
  const { fullName, email, password } = req.body;

  //   Checking for files
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required");

  //   Upload image to cloudinary
  const avatar = await cloudinaryUploader(avatarLocalPath);
  const coverImage = await cloudinaryUploader(coverImageLocalPath);

  if (!avatar) throw new ApiError(400, "Avatar file is required");

  //   creating new user to database
  const newUser = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage.url || "",
    email,
    password,
  });

  if (!newUser) throw new ApiError(500, "Error in user registration");

  //   Delete password,refreshToken from newUser
  delete newUser.password;
  delete newUser.refreshToken;

  return res
    .status(201)
    .json(new ApiResponse(201, newUser, "User registered successful"));
});

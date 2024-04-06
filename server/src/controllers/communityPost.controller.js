import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { CommunityPost } from "../models/communityPost.model";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  createCommunityPost,
  updateCommunityPost,
} from "../validators/communityPost.validator.js";

export const createComPost = asyncHandler(async (req, res) => {
  const { success, error } = createCommunityPost.safeParse(req.body);
  if (!success) throw new ApiError(411, error.errors);

  const { content } = req.body;
  const newPost = await CommunityPost.create({
    content,
    postedBy: req.user._id,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, newPost, "Post created successfully"));
});

export const getUserComPosts = asyncHandler(async (req, res) => {
  // Pagination left
  const userAllPost = await CommunityPost.find({
    postedBy: req.user._id,
  }).populate({ path: "createdBy", select: "userName fullName avatar" });

  return res
    .status(200)
    .json(new ApiResponse(200, userAllPost, "Successfully get all user"));
});

export const updateComPost = asyncHandler(async (req, res) => {
  const { success, error } = updateCommunityPost.safeParse(req.body);
  if (!success) throw new ApiError(411, error.errors);

  const { content, id } = req.body;
  const updatedPost = await CommunityPost.findByIdAndUpdate(
    id,
    {
      $set: {
        content,
      },
    },
    { new: true }
  );

  return res
    .status(202)
    .json(new ApiResponse(201, updatedPost, "Successfully updated"));
});

export const deleteComPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new ApiError(404, "Id not found");

  const deletePost = await CommunityPost.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, deleteComPost, "Successfully deleted post"));
});

import { Comment } from "../models/comment.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createCommentValidator,
  updateCommentValidation,
} from "../validators/comment.validator.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
});

export const addComment = asyncHandler(async (req, res) => {
  const { success, error } = createCommentValidator.safeParse(req.body);
  if (!success) throw new ApiError(411, error.errors);

  const { content, video } = req.body;

  const newComment = await Comment.create({
    content,
    video,
    postedBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newComment, "Comment posted successfully"));
});

export const updateComment = asyncHandler(async (req, res) => {
  const { success, error } = updateCommentValidation.safeParse(req.body);
  if (!success) throw new ApiError(411, error.errors);

  const { content, id } = req.body;

  const updatedComment = await Comment.findByIdAndUpdate(
    id,
    {
      $set: { content },
    },
    { new: true }
  );

  res
    .status(202)
    .json(new ApiResponse(202, updatedComment, "updated successfully"));
});

export const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new ApiError(404, "Comment id not found");

  const comment = await Comment.findById(id).populate("video");
  if (!comment) throw new ApiError(404, "Comment not found");

  if (
    req.user._id ==
    String(comment?.postedBy || req.user._id == String(comment.video.createdBy))
  ) {
    await Comment.findByIdAndDelete(id);
    return res
      .status(202)
      .json(new ApiResponse(202, {}, "Comment deleted successfully"));
  }
  return res.status(400).json(new ApiResponse(400, {}, "Not able to delete"));
});

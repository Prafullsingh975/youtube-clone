import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  likeComment,
  likeCommunityPost,
  likeVideo,
} from "../validators/like.validator.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model";
import { Comment } from "../models/comment.model.js";
import { CommunityPost } from "../models/communityPost.model.js";

// we can use isValidObjectId() from mongoose to check valid objectId

export const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { success, error } = likeVideo.safeParse(req.params);
  if (!success) throw new ApiError(411, error.errors);

  const video = await Video.findById(videoId);
  if (!video || !video.isPublished)
    throw new ApiError(404, "Video not found or publish");

  const videoLike = await Like.findOne({
    $and: [{ video: videoId }, { likedBy: req.user._id }],
  });

  if (videoLike) {
    await videoLike.remove();
    return res
      .status(200)
      .json(new ApiResponse(200, videoLike, "Video unlike"));
  }
  const newVideoLike = await Video.create({
    video: videoId,
    likedBy: req.user._id,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, newVideoLike, "Video liked"));
});

export const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { success, error } = likeComment.safeParse(req.params);
  if (!success) throw new ApiError(411, error.errors);

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found or publish");

  const commentLike = await Like.findOne({
    $and: [{ comment: commentId }, { likedBy: req.user._id }],
  });

  if (commentLike) {
    await commentLike.remove();
    return res
      .status(200)
      .json(new ApiResponse(200, commentLike, "Comment unlike"));
  }
  const newCommentLike = await Like.create({
    comment: commentId,
    likedBy: req.user._id,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, newCommentLike, "Video liked"));
});

export const toggleCommunityLike = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { success, error } = likeCommunityPost.safeParse(req.params);
  if (!success) throw new ApiError(411, error.errors);

  const post = await CommunityPost.findById(postId);
  if (!post) throw new ApiError(404, "Post not found");

  const communityPost = await Like.findOne({
    $and: [{ communityPost: postId }, { likedBy: req.user._id }],
  });

  if (communityPost) {
    await communityPost.remove();
    return res
      .status(200)
      .json(new ApiResponse(200, communityPost, "Community post unlike"));
  }
  const newCommunityLike = await Like.create({
    communityPost: postId,
    likedBy: req.user._id,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, newCommunityLike, "Community post liked"));
});

export const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideo = await Like.aggregate([
    {
      $match: { likedBy: mongoose.Types.ObjectId(req.user?._id) },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "likedVideos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "createdBy",
              foreignField: "_id",
              as: "creator",
              pipeline: [
                {
                  $project: {
                    firstName: 1,
                    lastName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, likedVideo, "Liked videos fetch successfully"));
});

export const getVideoLikes = asyncHandler(async (req, res) => {
  const { success, error } = likeVideo.safeParse(req.params);
  if (!success) throw new ApiError(411, error.errors);

  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  const videoLikes = await Like.aggregate([
    {
      $match: { video: mongoose.Types.ObjectId(videoId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "likedBy",
        foreignField: "_id",
        as: "likedBy",
        pipeline: [
          {
            $project: {
              firstName: 1,
              lastName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        likedBy: 1,
      },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, videoLikes, "Video likes fetched successfully"));
});

export const getCommunityLikes = asyncHandler(async (req, res) => {
  const { success, error } = likeCommunityPost.safeParse(req.params);
  if (!success) throw new ApiError(411, error.errors);

  const { postId } = req.params;

  const post = await CommunityPost.findById(postId);
  if (!post) throw new ApiError(404, "Post not found");

  const postLikes = await Like.aggregate([
    {
      $match: { communityPost: mongoose.Types.ObjectId(postId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "likedBy",
        foreignField: "_id",
        as: "likedBy",
        pipeline: [
          {
            $project: {
              firstName: 1,
              lastName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        likedBy: 1,
      },
    },
  ]);
  return res
    .status(200)
    .json(new ApiResponse(200, postLikes, "Post likes fetched successfully"));
});

export const getCommentLikes = asyncHandler(async (req, res) => {
  const { success, error } = likeComment.safeParse(req.params);
  if (!success) throw new ApiError(411, error.errors);

  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found");

  const commentLike = await Like.aggregate([
    {
      $match: { comment: mongoose.Types.ObjectId(commentId) },
    },
    {
      $lookup: {
        from: "users",
        localField: "likedBy",
        foreignField: "_id",
        as: "likedBy",
        pipeline: [
          {
            $project: {
              firstName: 1,
              lastName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        likedBy: 1,
      },
    },
  ]);
  return res
    .status(200)
    .json(
      new ApiResponse(200, commentLike, "Comment likes fetched successfully")
    );
});

import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { allVideos, publishVideo } from "../validators/video.validator.js";
import { Video } from "../models/video.model.js";
import {
  cloudinaryUploader,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

export const getAllVideos = asyncHandler(async (req, res) => {
  const { success, error } = allVideos.safeParse(req.query);
  if (!success) throw new ApiError(411, error.errors);

  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  if (userId && !isValidObjectId(userId))
    throw new ApiError(400, "Invalid userId");

  const sort = {};
  if (sortBy && sortType) {
    sort[sortBy] = sortType === "asc" ? 1 : -1;
  } else {
    sort["createdAt"] = -1;
  }

  const pipeline = [];

  if (userId) {
    pipeline.push({
      $match: {
        $and: [
          { createdBy: mongoose.Types.ObjectId(userId) },
          { isPublished: true },
        ],
      },
    });
  }

  if (query) {
    pipeline.push({
      $match: {
        $text: {
          $search: query,
        },
      },
    });
  }
  if (sort) {
    pipeline.push({
      $sort: sort,
    });
  }

  // const skipedVideos = (page - 1) * 10;
  // pipeline.push({
  //   $skip: skipedVideos,
  // });
  // pipeline.push({
  //   $limit: limit,
  // });
  // const videos = await Video.aggregate(pipeline);

  const options = {
    page,
    limit,
  };

  const video = await Video.aggregatePaginate(pipeline, options);

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Successfully fetch videos"));
});

export const publishAVideo = asyncHandler(async (req, res) => {
  const { success, error } = publishVideo.safeParse(req.body);
  if (!success) throw new ApiError(411, error.errors);

  const { title, description } = req.body;
  const videoLocalPath = req.files?.video[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.path;

  if (!videoLocalPath) {
    throw new ApiError(400, "Not Found video file");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Not Found thumbnail file");
  }

  const videoRes = await cloudinaryUploader(videoLocalPath, "videos");
  const thumbnailRes = await cloudinaryUploader(
    thumbnailLocalPath,
    "thumbnails"
  );

  if (!videoRes || !thumbnailRes)
    throw new ApiError(500, "Something went wrong");

  const newVideo = await Video.create({
    title,
    description,
    duration: videoRes.duration,
    createdBy: req.user._id,
    video: { url: videoRes.url, publicId: videoRes.public_id },
    thumbnail: { url: thumbnailRes.url, publicId: thumbnailRes.public_id },
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newVideo, "Video uploaded successfully"));
});

export const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) throw new ApiError(404, "Video id not found");
  if (videoId && !isValidObjectId(videoId))
    throw new ApiError(400, "Invalid Video id");

  const video = Video.findById(videoId).populate({
    path: "createdBy",
    select: "fullName,userName",
  });

  if (!video)
    return res.status(200).json(new ApiResponse(200, {}, "Video not found"));

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"));
});

export const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!videoId || isValidObjectId(videoId))
    throw new ApiError(400, "Not valid object id");

  let thumbnailRes;

  if (req?.file?.thumbnail) {
    const thumbnailLocalPath = req.file.thumbnail.path;
    thumbnailRes = await cloudinaryUploader(thumbnailLocalPath, "thumbnails");
    if (!thumbnailRes.url)
      throw new ApiError(
        500,
        "Something went wrong while uploading new thumbnail"
      );
  }

  const updateObject = {};
  if (title) {
    updateObject.title = title;
  }
  if (description) updateObject.description = description;

  if (thumbnailRes)
    updateObject.thumbnail = {
      url: thumbnailRes.url,
      publicId: thumbnailRes.public_id,
    };

  const video = await Video.findByIdAndUpdate(videoId, { $set: updateObject });

  const oldThumbnailPublicId = video?.thumbnail.publicId;
  const response = await deleteFromCloudinary(oldThumbnailPublicId);

  if (response)
    return res
      .status(201)
      .json(new ApiResponse(201, null, "video details updated successfully"));
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        "video details updated successfully | Old thumbnail not deleted from cloud"
      )
    );
});

export const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || isValidObjectId(videoId))
    throw new ApiError(400, "Invalid Object id");

  const deletedVideo = await Video.findByIdAndDelete(videoId);
  if (!deletedVideo) throw new ApiError(404, "Video not found");

  return res
    .status(200)
    .json(new ApiResponse(200, deletedVideo, "Video deleted successfully"));
});

export const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if ((!videoId, isValidObjectId(videoId)))
    throw new ApiError(400, "Invalid video Id");

  const video = await Video.findById(videoId);
  video.isPublished = !video.isPublished;
  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Publish status updated successfully"));
});

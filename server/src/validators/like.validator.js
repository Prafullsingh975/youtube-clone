import zod from "zod";

export const likeVideo = zod.object({
  videoId: zod.string({ required_error: "Video id required" }),
});

export const likeComment = zod.object({
  commentId: zod.string({ required_error: "Comment id required" }),
});

export const likeCommunityPost = zod.object({
  postId: zod.string({ required_error: "Community post id required" }),
});

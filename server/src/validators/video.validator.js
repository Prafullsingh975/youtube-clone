import zod from "zod";

export const allVideos = zod.object({
  page: zod
    .number({ invalid_type_error: "provide number" })
    .gt(0, "page vale is greater than 0")
    .finite("Provide finite number")
    .optional(),
  limit: zod
    .number({ invalid_type_error: "provide number" })
    .gt(0, "limit should be greater than 0")
    .lte(50, "limit is not more than 50")
    .finite("Provide finite number")
    .optional(),
  query: zod.string({ required_error: "query required" }).trim().optional(),
  sortBy: zod.string({ required_error: "sortBy required" }).trim().optional(),
  sortType: zod.enum(["asc", "dsc"]).optional(),
});

export const publishVideo = zod.object({
  title: zod.string({ required_error: "title required" }).trim(),
  description: zod.string({ required_error: "Description requires" }).trim(),
});

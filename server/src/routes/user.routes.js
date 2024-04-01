import { Router } from "express";
import {
  changePassword,
  getLoggedInUser,
  loginUser,
  logoutUser,
  profilePage,
  refreshAccessToken,
  registerUser,
  updateAvatar,
  updateCoverImage,
  updateUserDetails,
  watchHistory,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
router.route("/login").post(loginUser);
router.route("/logout").get(isLoggedIn, logoutUser);
router.route("/logged-in-user").get(isLoggedIn, getLoggedInUser);
router.route("/refresh-access-token").post(refreshAccessToken);
router.route("/change-password").patch(isLoggedIn, changePassword);
router.route("/detail").patch(isLoggedIn, updateUserDetails);
router
  .route("/change-avatar")
  .patch(isLoggedIn, upload.single("avatar"), updateAvatar);
router
  .route("/change-cover-image")
  .patch(isLoggedIn, upload.single("coverImage"), updateCoverImage);
router.route("/:userName").get(isLoggedIn, profilePage);
router.route("/").get(isLoggedIn, watchHistory);
export default router;

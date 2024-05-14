import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateUserAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  otpVerification,
  sendOTP,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

// done
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

// done
router.route("/login").post(loginUser);

// sent otp
router.route("/login/send-otp").post(sendOTP);
// otpVerification route
router.route("/login/otp-verification").post(otpVerification);
// secured routes done
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

//done
router.route("/change-password").post(verifyJWT, changeCurrentPassword);

router.route("/current-user").get(verifyJWT, getCurrentUser);

router
  .route("/update-account-details")
  .patch(verifyJWT, updateUserAccountDetails);

router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

router
  .route("/update-cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

// get from params  /users/c/username exm /users/c/krish
router.route("/c/:userName").get(verifyJWT, getUserChannelProfile);

// done
router.route("/watch-history").get(verifyJWT, getWatchHistory);
export default router;

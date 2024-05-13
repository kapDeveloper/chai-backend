import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose, { Schema } from "mongoose";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import { Otp } from "../models/otp.model.js";
// token

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // save at db
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: true });

    return { accessToken, refreshToken };
    const options = {
      httpOnly: true,
      secure: true,
    };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // step 1:
  const { email, password, userName, fullName } = req.body;
  // console.log("req.file", req.files);
  // console.log("Email: ", email);

  // step 2: validation

  // basic method
  // if (fullName === " ") {
  //   throw new ApiError(400, "FullName is required");
  // }

  // advance
  if (
    [fullName, email, userName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All field are required");
  }

  //step 3: check user already exits or not

  const existUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // step 4 check for images or check for avatar
  // get path by multer
  // const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  // if (!avatarLocalPath) {
  //   throw new ApiError(400, "Avatar file is required");
  // }

  let avatarLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.avatar) &&
    req.files.avatar.length > 0
  ) {
    avatarLocalPath = req.files.avatar[0].path;
  }

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  // step 5: upload them to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  // step 6: create user object in db

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase(),
    // userName,
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "kap.globalia@gmail.com",
      pass: "zrcw myub zigd idhn",
    },
  });

  let info = await transporter.sendMail({
    from: "kap.globalia@gmail.com",
    to: email,
    subject: "Successfully Registration Mail ",
    text: `Thank You ${fullName} for registering with us. Keep safe your Email id: ${email} and Password: ${password} `,
  });

  console.log(`Message send:`, info.messageId);
  res.json(info);

  // check user creation
  const createUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createUser) {
    throw new ApiError(500, "something went wrong while registering the user ");
  }

  // step return user response
  // return res.status(201).json({ createUser });

  return res
    .status(201)
    .json(new ApiResponse(200, createUser, "User register successfully"));
});

// const loginUser = asyncHandler(async (res, req) => {
//   // 1 req body - data
//   // 2 username or email
//   // 3 find the user
//   // 4 password check
//   // 5 generate access and refresh token
//   // 6 send cookie

const loginUser = asyncHandler(async (req, res) => {
  // req body -> data
  // username or email
  //find the user
  //password check
  //access and referesh token
  //send cookie

  const { email, username, password } = req.body;
  // console.log(email);

  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }

  // Here is an alternative of above code based on logic discussed in video:
  // if (!(username || email)) {
  //     throw new ApiError(400, "username or email is required")

  // }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  // const isPasswordValid = await bcrypt.compare(password, user.password);

  // if (!isPasswordValid) {
  //   throw new ApiError(401, "Invalid user credentials");
  // }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  // const loggedInUser = await User.findById(user._id).select(
  //   "-password -refreshToken"
  // );

  const options = {
    httpOnly: true,
    secure: true,
  };
  // console.log(options);  `

  const otp = Math.round(Math.random() * 9000 + 1000);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "kap.globalia@gmail.com",
      pass: "zrcw myub zigd idhn",
    },
  });

  let info = await transporter.sendMail({
    from: "kap.globalia@gmail.com",
    to: email,
    subject: "OTP Verification",
    text: `please confirm your OTP: ${otp}`,
  });

  console.log(`Message send:`, info.messageId);
  // res.json(info);

  const otpUser = await Otp.create({
    otp,
    email,
  });

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          // user: loggedInUser,
          // accessToken,
          // refreshToken,
        },
        "OTP Sent Successfully"
      )
    );
});
const otpVerification = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  console.log(email, " And ", otp);

  if (!email && !otp) {
    throw new ApiError(400, "email and otp is required");
  }

  const user = await Otp.findOne({
    $or: [{ otp }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const loggedInUser = await Otp.findById(user._id).select("-password");
  console.log(loggedInUser);

  if (!(otp === loggedInUser.otp)) {
    throw new ApiError(400, "Sorry you entered wrong OTP");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { user: loggedInUser }, "Account is verified"));
});

//wexovoc528@bsomek.com

//   //1
//   const { email, userName, password } = req.body;

//   //2
//   if (!userName && !email) {
//     throw new ApiError(400, "username and email is required");
//   }

//   //when we need username or email base authorized if(!(username \\ email))

//   //3

//   // User.findOne({ email });

//   // find by username or email use $or mongodb operator $or:[{},{}]
//   const user = await User.findOne({
//     $or: [{ userName }, { email }],
//   });

//   if (!user) {
//     throw new ApiError(404, "user not found");
//   }

//   //4 password check
//   const isPasswordValid = await user.isPasswordCorrect(password);

//   if (!isPasswordValid) {
//     throw new ApiError(401, "Invalid user credentials");
//   }
//   const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
//     user._id
//   );

//   // which field not required
//   const loggedUser = await User.findById(user._id).select(
//     "-password -refreshToken"
//   );

//   //6 send cookie
//   const options = {
//     httpOnly: true,
//     secure: true,
//   };

//   return res
//     .status(200)
//     .cookie("accessToken", accessToken, options)
//     .cookie("refreshToken", refreshToken, options)
//     .json(
//       new ApiResponse(
//         200,
//         { user: loggedUser, accessToken, refreshToken },
//         "User logged in successfully"
//       )
//     );

//   // when user want to save access and refresh token
// });

// Logout
// step clear user cookie and remove refreshToken
const logoutUser = asyncHandler(async (req, res) => {
  // req.user._id;

  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User :Logged out  "));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }
  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  try {
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});

// change current password

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "invalid old password");
  }
  // set not save
  user.password = newPassword;
  // we can nor want to check others validation
  user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed successfully"));

  // if we want to compare it with confirmPassword
  // if(!(newPassword===confirmPassword)){
  //   throw new ApiError()
  // }
});

// get logged user
const getCurrentUser = asyncHandler(async (res, req) => {
  return res.status(200).json(200, {}, "current user fetched successfully");
});

// update user account details
const updateUserAccountDetails = asyncHandler(async (res, req) => {
  const { fullName, email } = req.body;
  if (!fullName && !email) {
    throw new ApiError(400, "All fields are required");
  }

  // user
  // req.user?.id;

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        // email: email,
        email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User Updated Successfully"));
});

// update avatar and   of user

// ToDo delete old Avatar
const updateUserAvatar = asyncHandler(async (res, req) => {
  const avatarLocalPath = req.file?.path;

  // validate at user
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  // upload it on clodinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  // now update

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User Avatar Update Successfully"));
});

// update coverImage
const updateUserCoverImage = asyncHandler(async (res, req) => {
  const coverImageLocalPath = req.file?.path;

  // validate at user
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover Image file is missing");
  }

  // upload it on clodinary
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading on coverImage");
  }

  // now update

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User Cover Image Update Successfully"));
});

// getUserChannel

const getUserChannelProfile = asyncHandler(async (res, req) => {
  const { userName } = req.params;
  if (!userName?.trim()) {
    throw new ApiError(400, "username is missing");
  }

  // User.find({ userName });
  const channel = await User.aggregate([
    {
      $match: {
        userName: userName?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      // give selected fields
      $project: {
        fullName: 1,
        email: 1,
        subscriberCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  console.log(channel);
  if (!channel?.length) {
    throw new ApiError(400, " chanel does not exists");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully")
    );
});

// getWatchHistory
const getWatchHistory = asyncHandler(async (req, res) => {
  // here we found string we need to convert it to id
  // res.user._id;

  const user = await User.aggregate([
    {
      $match: {
        // _id: res.user._id,
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    userName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  if (!user) {
    throw new ApiError(400, "Invalid user watch history");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "watch history fetched successfully"
      )
    );
});
//export
export {
  otpVerification,
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUserAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};

// step to register user

// get user details from frontend / postman
// validation on user data - not empty
// check if user already exits: - email or username
// check for images or check for avatar
// if they available upload on cloudinary , check avatar exit or n

// create user object - create entry in db
// once user created successfully then remove password and refresh token field from response
// check for user creation
// return user

// Aggregation
// [
//   {
//     $lookup: {
//       from:"authors",
//       localField:"author_id",
//       foreignField: "_id",
//       as: "authors_details"
//     }
//   },
//   {
//     $addFields: {
//       authors_details:{
//         // $first:"$authors_details"
//         $arrayElemAt:["$authors_details", 0]
//       }
//     }
//   }
// ]

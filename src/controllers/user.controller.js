import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // step 1:
  const { email, password, userName, fullName } = req.body;
  console.log("req.file", req.files);
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
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
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
export { registerUser };

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

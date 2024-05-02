import { asyncHandler } from "../utils/asyncHandler.js";

// const registerUser = asyncHandler(async (res, req, next, err) => {
//   res.status(200).json({
//     message: "ok",
//   });
// });

const registerUser = asyncHandler(async (req, res) => {
  // send message to postman
  // res.status(200).json({
  //   message: "ok",
  // });
  // get data from postman and seen at console
  // const { email, fullName } = req.body;
  // console.log("Email: ", email);
  // console.log("FullName: ", fullName);
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


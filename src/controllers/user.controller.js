import { asyncHandler } from "../utils/asyncHandler.js";

// const registerUser = asyncHandler(async (res, req, next, err) => {
//   res.status(200).json({
//     message: "ok",
//   });
// });

const registerUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "ok",
  });
});
export { registerUser };

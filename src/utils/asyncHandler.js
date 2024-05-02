const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => {
      next(err);
    });
  };
};

export { asyncHandler };

// way 2 Try Catch
// const asyncHandler = () => {};
// const asyncHandler = (function) = ()=> {};
// const asyncHandler = (fun) => async () => {};

// const asyncHandler = (fun) => async (res, req, next) => {
//   try {
//     await fun(req, res, next);
//   } catch (error) {
//     res.status(err.code || 500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

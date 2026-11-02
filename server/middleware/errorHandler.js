export const errorHandler = (err, req, res, next) => {
  console.error("[ServerError]", req.method, req.originalUrl, err);
  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
  });
};

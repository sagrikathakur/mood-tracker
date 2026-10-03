export const validate = (schema) => {
  return (req, res, next) => {
    if (!schema) {
      return res.status(500).json({
        success: false,
        message: "Validation schema is missing",
      });
    }

    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.errors.map((err) => err.message),
      });
    }

    req.body = result.data;

    next();
  };
};
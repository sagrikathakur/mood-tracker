export const validate = (schema, source = "body") => {
  return (req, res, next) => {
    if (!schema) {
      return res.status(500).json({
        success: false,
        message: "Validation schema is missing",
      });
    }

    const dataToValidate = source === "query" ? req.query : req.body;
    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.errors.map((err) => err.message),
      });
    }

    if (source === "query") {
      req.query = result.data;
    } else {
      req.body = result.data;
    }

    next();
  };
};

export const validateQuery = (schema) => validate(schema, "query");
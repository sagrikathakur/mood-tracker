import { verifyAccessToken } from "../utils/token.js";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = verifyAccessToken(token);
    const userId = decoded.userId || decoded.id;

    // Check for stale tokens containing non-numeric IDs from previous schemas
    if (!userId || isNaN(Number(userId))) {
      return res.status(401).json({ message: "Invalid or expired session. Please log in again." });
    }

    req.user = {
      ...decoded,
      id: Number(userId),
    };
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export const requireAdmin = (req, res, next) => {
  authenticateToken(req, res, () => {
    const adminEmail = process.env.ADMIN_EMAIL || "sagrikathakur68@gmail.com";
    if (
      req.user &&
      (req.user.role === "admin" ||
        req.user.email === adminEmail ||
        req.user.email === "sagrikathakur68@gmail.com")
    ) {
      return next();
    }
    return res.status(403).json({
      success: false,
      message: "Forbidden: Admin privileges required to view or manage messages.",
    });
  });
};

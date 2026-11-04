/**
 * Lightweight XSS & HTML Input Sanitization Middleware
 * Recursively cleans incoming JSON body to neutralize script injection,
 * malicious event handlers (onload, onerror), and javascript: protocol URIs.
 */

const sanitizeString = (str) => {
  if (typeof str !== "string") return str;

  return str
    // Remove script tags and contents
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove dangerous inline event handlers like onload=, onerror=, onclick=
    .replace(/\bon\w+\s*=\s*(['"]).*?\1/gi, "")
    .replace(/\bon\w+\s*=\s*[^>\s]+/gi, "")
    // Neutralize javascript: and vbscript: URIs
    .replace(/javascript\s*:/gi, "blocked:")
    .replace(/vbscript\s*:/gi, "blocked:");
};

const sanitizeValue = (val) => {
  if (val === null || val === undefined) return val;
  if (typeof val === "string") return sanitizeString(val);
  if (Array.isArray(val)) return val.map(sanitizeValue);
  if (typeof val === "object") {
    const cleaned = {};
    for (const [key, v] of Object.entries(val)) {
      cleaned[key] = sanitizeValue(v);
    }
    return cleaned;
  }
  return val;
};

export const sanitizeInput = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === "object") {
    req.query = sanitizeValue(req.query);
  }
  next();
};

export default sanitizeInput;


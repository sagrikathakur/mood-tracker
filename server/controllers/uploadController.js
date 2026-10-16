import fs from "fs";
import path from "path";
import crypto from "crypto";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Ensure uploads folder exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export const uploadImage = async (req, res, next) => {
  try {
    const { image, filename } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "No image data provided. Provide a base64 encoded image string.",
      });
    }

    // Match data URI scheme: data:image/png;base64,...
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    let mimeType = "image/jpeg";
    let base64Data = image;

    if (matches && matches.length === 3) {
      mimeType = matches[1].toLowerCase();
      base64Data = matches[2];
    } else if (filename) {
      const ext = path.extname(filename).toLowerCase();
      if (ext === ".png") mimeType = "image/png";
      else if (ext === ".webp") mimeType = "image/webp";
      else if (ext === ".gif") mimeType = "image/gif";
      else mimeType = "image/jpeg";
    }

    const extension = ALLOWED_MIME_TYPES[mimeType];
    if (!extension) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed.",
      });
    }

    const buffer = Buffer.from(base64Data, "base64");

    // Max 10MB
    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "Image exceeds maximum allowed size of 10MB.",
      });
    }

    const uniqueName = `${crypto.randomUUID()}${extension}`;
    const filePath = path.join(UPLOADS_DIR, uniqueName);

    await fs.promises.writeFile(filePath, buffer);

    const imageUrl = `/uploads/${uniqueName}`;

    return res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl,
      filename: uniqueName,
    });
  } catch (error) {
    next(error);
  }
};

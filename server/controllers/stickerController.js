import { findAllStickers, createSticker } from "../models/stickerModel.js";

export const getStickers = async (req, res, next) => {
  try {
    const stickers = await findAllStickers();
    return res.status(200).json({
      success: true,
      stickers,
    });
  } catch (error) {
    next(error);
  }
};

export const addSticker = async (req, res, next) => {
  try {
    const { name, emoji, imageUrl, category } = req.body;
    const sticker = await createSticker({ name, emoji, imageUrl, category });
    return res.status(201).json({
      success: true,
      sticker,
    });
  } catch (error) {
    next(error);
  }
};

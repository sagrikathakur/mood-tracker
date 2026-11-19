import {
  createContactMessage,
  getAllContactMessages,
  getContactMessageStats,
  updateContactMessageStatus,
  deleteContactMessage,
} from "../models/contactModel.js";
import { sendContactEmail } from "../services/emailService.js";

/**
 * Controller for submitting a contact message & sending email via Nodemailer
 */
export const submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, topic, message, location: clientLocation } = req.body;

    const trimmedName = String(name || "").trim();
    const trimmedEmail = String(email || "").trim().toLowerCase();
    const trimmedMessage = String(message || "").trim();
    const trimmedTopic = String(topic || "General").trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required fields.",
      });
    }

    // Security: Validate email pattern and length
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail) || trimmedEmail.length > 150) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    // Security: Validate reasonable bounds
    if (trimmedName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must be under 100 characters.",
      });
    }

    if (trimmedMessage.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Message must be under 5000 characters.",
      });
    }

    // Determine location from client payload or IP fallback
    const clientIp =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "127.0.0.1";

    const resolvedLocation =
      clientLocation && String(clientLocation).trim() !== ""
        ? String(clientLocation).trim().slice(0, 100)
        : "Local Dev / Browser";

    // 1. Store contact record in PostgreSQL
    const savedMessage = await createContactMessage({
      name: trimmedName,
      email: trimmedEmail,
      topic: trimmedTopic.slice(0, 50),
      message: trimmedMessage,
      location: resolvedLocation,
      ipAddress: clientIp,
    });

    const formattedTime = new Date(savedMessage.created_at).toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "medium",
    });

    // 2. Dispatch real email using Nodemailer
    const mailResult = await sendContactEmail({
      name: savedMessage.name,
      email: savedMessage.email,
      topic: savedMessage.topic,
      message: savedMessage.message,
      location: savedMessage.location,
      time: formattedTime,
    });

    return res.status(201).json({
      success: true,
      message: "Thank you! Your message has been sent successfully.",
      data: {
        id: savedMessage.id,
        name: savedMessage.name,
        email: savedMessage.email,
        time: formattedTime,
        location: savedMessage.location,
        topic: savedMessage.topic,
        mailDispatched: mailResult.success,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller for Admin Panel Dashboard: Fetch all messages with time and location
 */
export const getAdminMessages = async (req, res, next) => {
  try {
    const messages = await getAllContactMessages({ limit: 100 });
    const stats = await getContactMessageStats();

    return res.status(200).json({
      success: true,
      stats,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to update message read/unread status
 */
export const updateMessageStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["read", "unread"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'read' or 'unread'.",
      });
    }

    const updated = await updateContactMessageStatus(id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Message not found." });
    }

    return res.status(200).json({
      success: true,
      message: `Message marked as ${status}.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to delete a message
 */
export const removeContactMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await deleteContactMessage(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Message not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};


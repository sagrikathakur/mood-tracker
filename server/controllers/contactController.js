import {
  createContactMessage,
  getAllContactMessages,
  getContactMessageStats,
  updateContactMessageStatus,
  deleteContactMessage,
} from "../models/contactModel.js";
import { sendContactEmail } from "../services/emailService.js";
import kafkaService from "../services/kafkaService.js";

/**
 * Controller for submitting a contact message & sending email via Nodemailer
 */
export const submitContactMessage = async (req, res, next) => {
  try {
    const { name, email, topic, message, location: clientLocation } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required fields.",
      });
    }

    // Determine location from client payload or IP fallback
    const clientIp =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "127.0.0.1";

    const resolvedLocation =
      clientLocation && clientLocation.trim() !== ""
        ? clientLocation.trim()
        : "Local Dev / Browser";

    // 1. Store contact record in PostgreSQL
    const savedMessage = await createContactMessage({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      topic: topic || "feedback",
      message: message.trim(),
      location: resolvedLocation,
      ipAddress: clientIp,
    });

    const formattedTime = new Date(savedMessage.created_at).toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "medium",
    });

    // 2. Stream notification event to Kafka
    kafkaService.sendEvent(kafkaService.TOPICS.NOTIFICATIONS, {
      messageId: savedMessage.id,
      name: savedMessage.name,
      email: savedMessage.email,
      topic: savedMessage.topic,
      location: resolvedLocation,
      timestamp: savedMessage.created_at,
    }, savedMessage.email);

    // 3. Dispatch real email using Nodemailer
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


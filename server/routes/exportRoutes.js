import express from "express";
import { exportUserData, purgeUserAccount } from "../controllers/exportController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/download", exportUserData);
router.delete("/purge", purgeUserAccount);

export default router;


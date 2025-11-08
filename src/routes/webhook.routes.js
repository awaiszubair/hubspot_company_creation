import express from "express";
import { handleCompanyCreated } from "../controllers/webhook.controller.js";

const router = express.Router();
router.post("/company-created", handleCompanyCreated);

export default router;

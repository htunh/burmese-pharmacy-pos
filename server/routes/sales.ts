import express from "express";
import { createSale, getSaleDetails } from "../controllers/saleController";

const router = express.Router();

router.post("/", createSale);
router.get("/:id", getSaleDetails);

export default router;

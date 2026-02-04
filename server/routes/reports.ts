import express from "express";
import { getProfit, getLedger } from "../controllers/reportController";

const router = express.Router();

router.get("/profit", getProfit);
router.get("/ledger", getLedger);

export default router;

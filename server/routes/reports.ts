import express from "express";
import {
  getProfit,
  getLedger,
  getDetailedProfit,
} from "../controllers/reportController";

const router = express.Router();

router.get("/profit", getProfit);
router.get("/ledger", getLedger);
router.get("/detailed-profit", getDetailedProfit);

export default router;

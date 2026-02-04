import express from "express";
import { receiveStock, getStockHistory } from "../controllers/stockController";

const router = express.Router();

router.post("/receive", receiveStock);
router.get("/history", getStockHistory);

export default router;

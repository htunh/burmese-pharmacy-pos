import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDb } from "./db/schema";

import productsRouter from "./routes/products";
import salesRouter from "./routes/sales";
import reportsRouter from "./routes/reports";
import stockRouter from "./routes/stock";

dotenv.config();

// Initialize DB Schema
initDb();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

console.log("Server initialized.");

// Register Routes
app.use("/products", productsRouter);
app.use("/sale", salesRouter); // helper for POST /sale handled as / in salesRouter
app.use("/report", reportsRouter); // handles /report/profit
app.use("/api", reportsRouter); // handles /api/ledger
app.use("/api/sales", salesRouter); // handles /api/sales/:id
app.use("/api/stock", stockRouter); // handles /api/stock/receive

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

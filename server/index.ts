import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initDb } from "./db/database";

import productsRouter from "./routes/products";
import salesRouter from "./routes/sales";
import reportsRouter from "./routes/reports";

dotenv.config();

// Initialize DB Schema
initDb();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

console.log("Connected to SQLite database via database.ts");

// Register Routes
app.use("/products", productsRouter);
app.use("/sale", salesRouter); // helper for POST /sale handled as / in salesRouter
app.use("/report", reportsRouter); // handles /report/profit
app.use("/api", reportsRouter); // handles /api/ledger
app.use("/api/sales", salesRouter); // handles /api/sales/:id

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

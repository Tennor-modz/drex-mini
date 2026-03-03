// 🔥 GLOBAL PROCESS ERROR LOGGING (MUST be at the very top)
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

// ------------------- YOUR SERVER CODE -------------------

const express = require("express");
const app = express();
const bodyParser = require("body-parser");

// ✅ STEP 1: CORS — MUST be FIRST middleware (after app init)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// ✅ STEP 2: Ping timing — after CORS, before routes
app.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

require("events").EventEmitter.defaultMaxListeners = 500;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ STEP 3: Routes — now ALL inherit CORS
const qrRoute = require("./qr");
const codeRoute = require("./pair");
const statsRoute = require("./stats");
const { router: pingRouter } = require("./ping");

app.use("/qr", qrRoute);
app.use("/code", codeRoute);
app.use("/stats", statsRoute);
app.use("/ping", pingRouter);

// Health Check
app.get("/", (req, res) => {
  res.json({
    status: "Online",
    message: "Trashcore pairing backend is running",
  });
});

// Express error handler
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err.stack || err);
  res.status(500).json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 8000;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});

module.exports = app;

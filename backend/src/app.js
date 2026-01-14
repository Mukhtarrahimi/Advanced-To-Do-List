const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

// Import Routes
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoute");

// Import Middleware
const { notFound, errorHandler } = require("./middlewares/errorHandler");


// Security
app.use(helmet());

// CORS
app.use(
    cors({
        origin: true,
        credentials: true,
    })
);

// Body Parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Logger
if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);


// Health Check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        env: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString(),
    });
});
// Error Handling Middleware

app.use(notFound);
app.use(errorHandler);

module.exports = app;

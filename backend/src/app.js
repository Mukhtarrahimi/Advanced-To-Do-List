import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgen from "morgen";

const app = express();

// middleware
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(helmet());

if (process.env.NODE_ENV !== "production") {
  app.use(morgen("dev"));
}

// 404 error hander
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    paht: req.originalUrl,
  });
});

// global error handler
app.use((err, req, res, next) => {
  console.error(err);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    message: err.message || "Internal Server Error!",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
});

export default app;

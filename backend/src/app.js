import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgen from "morgen";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgen("dev"));

export default app;

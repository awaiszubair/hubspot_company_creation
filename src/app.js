import express from "express";
import bodyParser from "body-parser";
import webhookRoutes from "./routes/webhook.routes.js";

export function createServer() {
  const app = express();

  app.use(bodyParser.json());
  app.use("/webhook", webhookRoutes);

  app.get("/", (req, res) => res.send("✅ Server is alive"));

  app.get("/testing", (req, res) => {
    res.json({ message: "Testing endpoint working fine!" });
  });

  return app;
}

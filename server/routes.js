import { createServer } from "http";
import { storage } from "./storage";

export async function registerRoutes(httpServer, app) {
  app.get('/api/status', (req, res) => {
    res.json({ status: 'ok' });
  });

  return httpServer;
}

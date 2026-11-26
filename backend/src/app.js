import express from "express";
import { db } from "./db/index.js";
import { avaliacoes } from "./db/schemas/schema.avaliacao.js";
import authRoutes from "./routes/auth.routes.js";
import avaliacoesRoutes from "./routes/avaliacao.js"
import cors from "cors";

const app = express();
const URL_FRONTEND = [...new Set([
  "http://localhost:3000",
  "http://localhost:3001",
  ...(process.env.FRONTEND_URL || "").split(",").map((origin) => origin.trim()).filter(Boolean),
])];
app.use(cors({
  origin: URL_FRONTEND,
  methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use(express.json({ limit: "1mb" }));
app.use(authRoutes);
app.use("/avaliacoes", avaliacoesRoutes);


app.get("/avaliacoes", async (req, res) => {
  try {
    const resultado = await db
      .select()
      .from(avaliacoes);

    res.json(resultado);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      erro: "Não foi possível consultar as avaliações.",
    });
  }
});

export default app;

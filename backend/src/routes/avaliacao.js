import { Router } from "express";
import * as controller from "../controllers/avaliacao.js";
import { autenticarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", autenticarToken, controller.cadastrarAvaliacao);
router.get("/", autenticarToken, controller.listarAvaliacoes);
router.put("/:id", autenticarToken, controller.atualizarAvaliacao);
router.delete("/:id", autenticarToken, controller.excluirAvaliacao);

export default router;

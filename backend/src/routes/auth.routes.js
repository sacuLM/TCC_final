import { Router } from "express";
import { cadastrarUsuario, fazerLogin, consultarPerfil, atualizarPerfil } from "../controllers/auth.controller.js";
import { autenticarToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/cadastro", cadastrarUsuario);
router.post("/login", fazerLogin);
router.get("/perfil", autenticarToken, consultarPerfil);
router.put("/perfil", autenticarToken, atualizarPerfil);

export default router;

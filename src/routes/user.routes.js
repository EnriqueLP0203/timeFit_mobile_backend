import { Router } from "express";
import {
  register,
  login,
  logout,
  profile,
  updateProfile,
  changeActiveGym,
  getUserInfo,
  deleteUser
} from "../controllers/userController.js";
import { authRequired } from '../middlewares/validateToken.js';

const router = Router();

// Registro de usuario
router.post("/register", register);

// Login de usuario
router.post("/login", login);

// Logout de usuario
router.post("/logout", logout);

// Obtener perfil del usuario
router.get("/profile", authRequired, profile);

// Actualizar perfil del usuario
router.put("/update-profile", authRequired, updateProfile);

// Obtener información completa del usuario (incluyendo gyms)
router.get("/info", authRequired, getUserInfo);

// Cambiar gym activo del usuario
router.put("/change-active-gym", authRequired, changeActiveGym);

// Eliminar usuario autenticado
router.delete("/", authRequired, deleteUser);

export default router;
import {Router} from "express";
import {
  createGym,
  getAllGyms,
  getGymById,
  updateGym,
  deleteGym,
  getGymByUser,
  getGymsByUser
} from "../controllers/gymController.js";
import { authRequired } from '../middlewares/validateToken.js';

const router = Router();

// Crear un nuevo gimnasio
router.post("/crear", authRequired, createGym);

// Obtener todos los gimnasios del usuario autenticado
router.get("/usuario/todos", authRequired, getGymsByUser);

// Obtener el gimnasio del usuario autenticado
router.get("/usuario/migym", authRequired, getGymByUser);

// Obtener todos los gimnasios
router.get("/obtener", authRequired, getAllGyms);

// Obtener un gimnasio por ID
router.get("/:id", authRequired, getGymById);

// Actualizar un gimnasio
router.put("/:id", authRequired, updateGym);

// Eliminar un gimnasio (con cascade)
router.delete("/:id", authRequired, deleteGym);

export default router;

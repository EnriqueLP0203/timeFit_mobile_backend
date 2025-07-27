import {Router} from "express";
import {
  createGym,
  getAllGyms,
  getGymById,
  updateGym,
  deleteGym,
} from "../controllers/gymController.js";
import { authRequired } from '../middlewares/validateToken.js';

const router = Router();

// Crear un nuevo gimnasio
router.post("/crear", authRequired, createGym);

// Obtener todos los gimnasios
router.get("/obtener", authRequired, getAllGyms);

// Obtener un gimnasio por ID
router.get("/:id", authRequired, getGymById);

// Actualizar un gimnasio
router.put("/:id", authRequired, updateGym);

// Eliminar un gimnasio
router.delete("/:id", authRequired, deleteGym);

export default router;

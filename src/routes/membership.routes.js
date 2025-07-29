import { Router } from "express";
import {
  createMembership,
  getAllMemberships,
  getMembershipById,
  updateMembership,
  deleteMembership,
  getMembershipsByGym
} from "../controllers/membershipController.js";
import { authRequired } from '../middlewares/validateToken.js';

const router = Router();

// Crear una membresía
router.post("/crear", authRequired, createMembership);

// Obtener todas las membresías del usuario
router.get("/obtener", authRequired, getAllMemberships);

// Obtener membresías por gym específico
router.get("/gym/:gymId", authRequired, getMembershipsByGym);

// Obtener una membresía por ID
router.get("/:id", authRequired, getMembershipById);

// Actualizar una membresía
router.put("/:id", authRequired, updateMembership);

// Eliminar una membresía
router.delete("/:id", authRequired, deleteMembership);

export default router;
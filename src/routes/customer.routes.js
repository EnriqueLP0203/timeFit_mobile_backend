import { Router } from "express";
import {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  getCustomersByGym,
  migrateCustomers
} from "../controllers/customerController.js";
import { authRequired } from '../middlewares/validateToken.js';

const router = Router();

// Crear un nuevo cliente
router.post("/crear", authRequired, createCustomer);

// Obtener todos los clientes del usuario
router.get("/obtener", authRequired, getAllCustomers);

// Obtener clientes por gym específico
router.get("/gym/:gymId", authRequired, getCustomersByGym);

// Migrar clientes existentes (ruta temporal)
router.post("/migrar", authRequired, migrateCustomers);

// Obtener cliente por ID
router.get("/:id", authRequired, getCustomerById);

// Actualizar cliente
router.put("/:id", authRequired, updateCustomer);

// Eliminar cliente
router.delete("/:id", authRequired, deleteCustomer);

export default router;
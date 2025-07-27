import {Router} from 'express'
import { createCustomer, getAllCustomers, getCustomerById, updateCustomer, deleteCustomer } from '../controllers/customerController.js';

const router = Router();

// Crear un nuevo cliente
router.post("/crear", createCustomer);

// Obtener todos los clientes
router.get("/obtener", getAllCustomers);

// Obtener un cliente por ID
router.get("/:id", getCustomerById);

// Actualizar un cliente
router.put("/:id",  updateCustomer);

// Eliminar un cliente
router.delete("/:id", deleteCustomer);


export default router;
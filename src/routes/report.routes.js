import {Router} from "express";
import { createReport, getAllReports, getReportById, updateReportStatus, deleteReport } from "../controllers/reportController.js";
import { authRequired } from "../middlewares/validateToken.js";

const router = Router();

// Crear un nuevo reporte
router.post("/crear", authRequired, createReport);

// Obtener todos los gimnasios
router.get("/obtener", getAllReports);

// Obtener un gimnasio por ID
router.get("/:id", getReportById);

// Actualizar un gimnasio
router.put("/:id", updateReportStatus);

// Eliminar un gimnasio
router.delete("/:id", deleteReport);

export default router;

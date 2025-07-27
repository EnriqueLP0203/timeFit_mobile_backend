import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";

export const authRequired = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Verifica que el header exista y tenga el formato correcto
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, TOKEN_SECRET);
    req.user = decoded; // Puedes acceder a req.user en las rutas protegidas
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token inválido o expirado" });
  }
};
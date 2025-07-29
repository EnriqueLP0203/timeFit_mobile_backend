import jwt from "jsonwebtoken";
import { TOKEN_SECRET } from "../config.js";

export const authRequired = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  console.log('🔐 Middleware de autenticación - URL:', req.url);
  console.log('🔐 Middleware de autenticación - Método:', req.method);
  console.log('🔐 Middleware de autenticación - Auth header:', authHeader ? 'Presente' : 'Ausente');

  // Verifica que el header exista y tenga el formato correcto
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log('❌ Token no proporcionado o formato incorrecto');
    return res.status(401).json({ message: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];
  console.log('🔐 Token extraído:', token ? 'Presente' : 'Ausente');
  console.log('🔐 Token length:', token ? token.length : 0);

  try {
    const decoded = jwt.verify(token, TOKEN_SECRET);
    console.log('✅ Token válido, usuario:', decoded.id);
    req.user = decoded; // Puedes acceder a req.user en las rutas protegidas
    next();
  } catch (err) {
    console.log('❌ Error al verificar token:', err.message);
    return res.status(403).json({ message: "Token inválido o expirado" });
  }
};
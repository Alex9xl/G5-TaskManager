import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/auth/UserModel.js";

export const protect = asyncHandler(async (req, res, next) => {
  try {
    // comprobar si el usuario ha iniciado sesión
    const token = req.cookies.token;

    if (!token) {
      // 401 Unauthorized
      res
        .status(401)
        .json({ message: "No autorizado, por favor iniciar sesión" });
    }

    // verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Obtener detalles del usuario a partir del token ----> excluir contraseña
    const user = await User.findById(decoded.id).select("-password");

    // comprobar si el usuario existe
    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Establecer detalles del usuario en el request object
    req.user = user;

    next();
  } catch (error) {
    // 401 Unauthorized
    res.status(401).json({ message: "No autorizado, token fallido" });
  }
});

// admin middleware
export const adminMiddleware = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    // Si el usuario es administrador, pasar al siguiente middleware/controller
    next();
    return;
  }
  // Si no es administrador,, envia 403 Forbidden --> finalizar la solicitud
  res
    .status(403)
    .json({ message: "Solo los administradores pueden hacer esto." });
});

export const creatorMiddleware = asyncHandler(async (req, res, next) => {
  if (
    (req.user && req.user.role === "creator") ||
    (req.user && req.user.role === "admin")
  ) {
    // Si el usuario es el creador, pasar al siguiente middleware/controller
    next();
    return;
  }
  // Si no es el creador, envia 403 Forbidden --> finalizar la solicitud
  res.status(403).json({ message: "Solo los creadores pueden hacer esto." });
});

// verificado middleware
export const verifiedMiddleware = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.isVerified) {
    // Si el usuario está verificado, pasar al siguiente middleware/controller
    next();
    return;
  }
  // Si no está verificado, envia 403 Forbidden --> Terminar la solicitud
  res
    .status(403)
    .json({ message: "Por favor verifique su dirección de email" });
});

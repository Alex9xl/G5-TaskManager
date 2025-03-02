import asyncHandler from "express-async-handler";
import User from "../../models/auth/UserModel.js";

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // intentar encontrar y eliminar al usuario
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.status(200).json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "No se puede eliminar al usuario" });
  }
});

// Obtener todos los usuarios
export const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find({});

    if (!users) {
      res.status(404).json({ message: "No se encontraron usuarios" });
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "No se pueden obtener usuarios" });
  }
});

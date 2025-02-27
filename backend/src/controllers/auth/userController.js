import asyncHandler from "express-async-handler";
import User from "../../models/auth/UserModel.js";
import generateToken from "../../helpers/generateToken.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Token from "../../models/auth/Token.js";
import crypto from "node:crypto";
import hashToken from "../../helpers/hashToken.js";
import sendEmail from "../../helpers/sendEmail.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // validación
  if (!name || !email || !password) {
    // 400 Bad Request
    res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  // comprobar la longitud de la contraseña
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "La contraseña debe tener al menos 6 caracteres" });
  }

  // comprobar si el usuario ya existe
  const userExists = await User.findOne({ email });

  if (userExists) {
    // bad request
    return res.status(400).json({ message: "El usuario ya existe" });
  }

  //crear nuevo usuario
  const user = await User.create({
    name,
    email,
    password,
  });

  // generar token con user id
  const token = generateToken(user._id);

  // devuelve el usuario y el token en la respuesta al cliente
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
    sameSite: "none", // cross-site access --> permitir todas las cookies de terceros
    secure: false,
  });

  if (user) {
    const { _id, name, email, role, photo, bio, isVerified } = user;

    // 201 Created
    res.status(201).json({
      _id,
      name,
      email,
      role,
      photo,
      bio,
      isVerified,
      token,
    });
  } else {
    res.status(400).json({ message: "Datos de usuario no válidos" });
  }
});

// user login
export const loginUser = asyncHandler(async (req, res) => {
  // obtener email and contraseña de req.body
  const { email, password } = req.body;

  // validacion
  if (!email || !password) {
    // 400 Bad Request
    return res
      .status(400)
      .json({ message: "Todos los campos son obligatorios" });
  }

  // comprobar si el usuario existe
  const userExists = await User.findOne({ email });

  if (!userExists) {
    return res
      .status(404)
      .json({ message: "Usuario no encontrado, regístrate" });
  }

  // comprobar si el id y contraseña coinciden con la contraseña hasheada en db
  const isMatch = await bcrypt.compare(password, userExists.password);

  if (!isMatch) {
    // 400 Bad Request
    return res.status(400).json({ message: "Credenciales inválidas" });
  }

  // generar token con user id
  const token = generateToken(userExists._id);

  if (userExists && isMatch) {
    const { _id, name, email, role, photo, bio, isVerified } = userExists;

    // Establezca el token en la cookie
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 dias
      sameSite: "none", // cross-site access --> permitir todas las cookies de terceros
      secure: true,
    });

    // Devolver el usuario y el token en la respuesta al cliente.
    res.status(200).json({
      _id,
      name,
      email,
      role,
      photo,
      bio,
      isVerified,
      token,
    });
  } else {
    res.status(400).json({ message: "Email o contraseña no válidos" });
  }
});

// logout user
export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
    path: "/",
  });

  res.status(200).json({ message: "Usuario desconectado" });
});

// get user
export const getUser = asyncHandler(async (req, res) => {
  // Obtener detalles del usuario a partir del token ----> excluir contraseña
  const user = await User.findById(req.user._id).select("-password");

  if (user) {
    res.status(200).json(user);
  } else {
    // 404 Not Found
    res.status(404).json({ message: "Usuario no encontrado" });
  }
});

// update user
export const updateUser = asyncHandler(async (req, res) => {
  // obtener detalles del usuario a partir del token ----> proteger middleware
  const user = await User.findById(req.user._id);

  if (user) {
    // Propiedades del usuario para actualizar
    const { name, bio, photo } = req.body;
    // actualizar propiedades del usuario
    user.name = req.body.name || user.name;
    user.bio = req.body.bio || user.bio;
    user.photo = req.body.photo || user.photo;

    const updated = await user.save();

    res.status(200).json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      photo: updated.photo,
      bio: updated.bio,
      isVerified: updated.isVerified,
    });
  } else {
    // 404 Not Found
    res.status(404).json({ message: "Usuario no encontrado" });
  }
});

// login status
export const userLoginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    // 401 Unauthorized
    res
      .status(401)
      .json({ message: "No autorizado, por favor iniciar sesión" });
  }
  // verificar el token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (decoded) {
    res.status(200).json(true);
  } else {
    res.status(401).json(false);
  }
});

// Verificacion de email
export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  // Si el usuario existe
  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  // Comprobar si el usuario ya está verificado
  if (user.isVerified) {
    return res.status(400).json({ message: "El usuario ya está verificado" });
  }

  let token = await Token.findOne({ userId: user._id });

  // Si el token existe --> borrar el token
  if (token) {
    await token.deleteOne();
  }

  // crear un token de verificación usando el user id --->
  const verificationToken = crypto.randomBytes(64).toString("hex") + user._id;

  // Hashear el token de verificación
  const hashedToken = hashToken(verificationToken);

  await new Token({
    userId: user._id,
    verificationToken: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 horas
  }).save();

  // link de verificacion
  const verificationLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

  // enviar email
  const subject = "Email Verification - AuthKit";
  const send_to = user.email;
  const reply_to = "noreply@gmail.com";
  const template = "emailVerification";
  const send_from = process.env.USER_EMAIL;
  const name = user.name;
  const url = verificationLink;

  try {
    // El orden importa ---> subject, send_to, send_from, reply_to, template, name, url
    await sendEmail(subject, send_to, send_from, reply_to, template, name, url);
    return res.json({ message: "Email enviado" });
  } catch (error) {
    console.log("Error al enviar el email:", error);
    return res.status(500).json({ message: "No se pudo enviar el email" });
  }
});

// verificar usuario
export const verifyUser = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;

  if (!verificationToken) {
    return res.status(400).json({ message: "Token de verificación no válido" });
  }
  // hashear al token de verificacion  --> porque fue codificado antes de guardarlo
  const hashedToken = hashToken(verificationToken);

  // Encuentra el usuario con el token de verificación
  const userToken = await Token.findOne({
    verificationToken: hashedToken,
    // comprobar si el token no ha expirado
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    return res
      .status(400)
      .json({ message: "Token de verificación no válido o vencido" });
  }

  // encuentra el usuario con el user id en el token
  const user = await User.findById(userToken.userId);

  if (user.isVerified) {
    // 400 Bad Request
    return res.status(400).json({ message: "El usuario ya está verificado" });
  }

  // Actualizar usuario a verificado
  user.isVerified = true;
  await user.save();
  res.status(200).json({ message: "Usuario verificado" });
});

// forgot password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Se requiere email" });
  }

  // comprobar si el usuario existe
  const user = await User.findOne({ email });

  if (!user) {
    // 404 Not Found
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  // Verificar si existe el token de reinicio
  let token = await Token.findOne({ userId: user._id });

  // si existe el token  --> eliminar el token
  if (token) {
    await token.deleteOne();
  }

  // crea un token de reinicio usando el user id ---> expira en 1 hora
  const passwordResetToken = crypto.randomBytes(64).toString("hex") + user._id;

  // hashear el token de reinicio
  const hashedToken = hashToken(passwordResetToken);

  await new Token({
    userId: user._id,
    passwordResetToken: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 60 * 60 * 1000, // 1 hora
  }).save();

  // restablecer link
  const resetLink = `${process.env.CLIENT_URL}/reset-password/${passwordResetToken}`;

  // Enviar email al usuario
  const subject = "Password Reset - AuthKit";
  const send_to = user.email;
  const send_from = process.env.USER_EMAIL;
  const reply_to = "noreply@noreply.com";
  const template = "forgotPassword";
  const name = user.name;
  const url = resetLink;

  try {
    await sendEmail(subject, send_to, send_from, reply_to, template, name, url);
    res.json({ message: "Email enviado" });
  } catch (error) {
    console.log("Error al enviar el email:", error);
    return res.status(500).json({ message: "No se pudo enviar el email" });
  }
});

// reset password
export const resetPassword = asyncHandler(async (req, res) => {
  const { resetPasswordToken } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Se requiere contraseña" });
  }

  // hashear el token de reinicio
  const hashedToken = hashToken(resetPasswordToken);

  // comprobar si el token existe y no ha expirado
  const userToken = await Token.findOne({
    passwordResetToken: hashedToken,
    // comprobar si el token no ha expirado
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    return res
      .status(400)
      .json({ message: "Token de reinicio no válido o vencido" });
  }

  // Encuentra el usuario con el user id en el token
  const user = await User.findById(userToken.userId);

  // update user password
  user.password = password;
  await user.save();

  res.status(200).json({ message: "Restablecimiento de contraseña exitoso" });
});

// change password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Todos los campos son obligatorios" });
  }

  //Buscar user by id
  const user = await User.findById(req.user._id);

  // Comparar la contraseña actual con la contraseña hasheada en la base de datos
  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: "Contraseña inválida" });
  }

  // reset password
  if (isMatch) {
    user.password = newPassword;
    await user.save();
    return res
      .status(200)
      .json({ message: "Contraseña cambiada exitosamente" });
  } else {
    return res
      .status(400)
      .json({ message: "No se pudo cambiar la contraseña" });
  }
});

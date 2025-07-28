import User from "../models/user.js";
import bcrypt from "bcryptjs";
import { createdAccessToken } from "../libs/jwt.js";

export const register = async (req, res) => {
  const { name, lastname, username, email, password } = req.body;

  // Validación básica
  if (!name || !lastname || !username || !email || !password) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  try {
    // Verificar si el usuario o correo ya existen
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "El correo o nombre de usuario ya están registrados" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      lastname,
      username,
      email,
      password: passwordHash,
    });

    const userSaved = await newUser.save();
    const token = await createdAccessToken({ id: userSaved.id });

    res.json({
      token,
      user: {
        id: userSaved.id,
        name: userSaved.name,
        lastname: userSaved.lastname,
        username: userSaved.username,
        email: userSaved.email,
        createdAt: userSaved.createdAt,
        updatedAt: userSaved.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  // Validación básica
  if (!email || !password) {
    return res.status(400).json({ message: "Correo y contraseña son obligatorios" });
  }

  try {
    const userFound = await User.findOne({ email });
    if (!userFound) {
      return res.status(400).json({ message: "Correo no encontrado, intenta de nuevo" });
    }

    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña incorrecta, intenta de nuevo" });
    }

    const token = await createdAccessToken({ id: userFound.id });

    // Buscar si el usuario tiene un gym creado
    const Gym = (await import("../models/Gym.js")).default;
    const gym = await Gym.findOne({ user_id: userFound._id });

    res.json({
      token,
      user: {
        id: userFound._id,
        username: userFound.username,
        email: userFound.email,
        createdAt: userFound.createdAt,
        updatedAt: userFound.updatedAt,
      },
      hasGym: !!gym,
      gym: gym || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = (req, res) => {
  // En apps móviles, el token se elimina del almacenamiento local, no de cookies
  return res.sendStatus(200);
};

export const profile = async (req, res) => {
  const userFound = await User.findById(req.user.id);

  if (!userFound) return res.status(400).json({ message: "Usuario no encontrado" });

  return res.json({
    id: userFound._id,
    name: userFound.name,
    lastname: userFound.lastname,
    username: userFound.username,
    email: userFound.email,
    createdAt: userFound.createdAt,
    updatedAt: userFound.updatedAt,
  });
};
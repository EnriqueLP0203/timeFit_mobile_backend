import User from "../models/user.js";
import bcrypt from "bcryptjs";
import { createdAccessToken } from "../libs/jwt.js";
import Gym from "../models/gym.js";

export const register = async (req, res) => {
  console.log('🔄 Registro iniciado');
  console.log('📝 Datos recibidos:', req.body);
  
  const { name, lastname, username, email, password } = req.body;

  // Validación básica
  if (!name || !lastname || !username || !email || !password) {
    console.log('❌ Campos faltantes');
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  try {
    console.log('🔍 Verificando usuario existente...');
    // Verificar si el usuario o correo ya existen
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      console.log('❌ Usuario ya existe');
      return res.status(400).json({ message: "El correo o nombre de usuario ya están registrados" });
    }

    console.log('🔐 Hasheando contraseña...');
    const passwordHash = await bcrypt.hash(password, 10);
    
    console.log('📝 Creando nuevo usuario...');
    const newUser = new User({
      name,
      lastname,
      username,
      email,
      password: passwordHash,
    });

    console.log('💾 Guardando usuario...');
    const userSaved = await newUser.save();
    
    console.log('🎫 Generando token...');
    const token = await createdAccessToken({ id: userSaved.id });

    console.log('✅ Usuario registrado exitosamente:', userSaved.email);
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
    console.log('❌ Error en registro:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  console.log('🔄 Login iniciado');
  console.log('📝 Datos recibidos:', { email: req.body.email, password: '***' });
  
  const { email, password } = req.body;

  // Validación básica
  if (!email || !password) {
    console.log('❌ Campos faltantes');
    return res.status(400).json({ message: "Correo y contraseña son obligatorios" });
  }

  try {
    console.log('🔍 Buscando usuario...');
    const userFound = await User.findOne({ email });
    if (!userFound) {
      console.log('❌ Usuario no encontrado');
      return res.status(400).json({ message: "Correo no encontrado, intenta de nuevo" });
    }

    console.log('🔐 Verificando contraseña...');
    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) {
      console.log('❌ Contraseña incorrecta');
      return res.status(400).json({ message: "Contraseña incorrecta, intenta de nuevo" });
    }

    console.log('🎫 Generando token...');
    const token = await createdAccessToken({ id: userFound.id });

    console.log('🏋️ Buscando gym del usuario...');
    // Buscar si el usuario tiene un gym creado
    const gym = await Gym.findOne({ user_id: userFound._id });

    console.log('✅ Login exitoso:', {
      user: userFound.email,
      hasGym: !!gym,
      gym: gym ? gym.name : 'No hay gym'
    });

    res.json({
      token,
      user: {
        id: userFound._id,
        name: userFound.name,
        lastname: userFound.lastname,
        username: userFound.username,
        email: userFound.email,
        createdAt: userFound.createdAt,
        updatedAt: userFound.updatedAt,
      },
      hasGym: !!gym,
      gym: gym || null
    });
  } catch (error) {
    console.log('❌ Error en login:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const logout = (req, res) => {
  // En apps móviles, el token se elimina del almacenamiento local, no de cookies
  return res.sendStatus(200);
};

export const profile = async (req, res) => {
  const userFound = await User.findById(req.user.id);
  if (!userFound) return res.status(404).json({ message: "User not found" });

  res.json({
    id: userFound._id,
    name: userFound.name,
    lastname: userFound.lastname,
    username: userFound.username,
    email: userFound.email,
    createdAt: userFound.createdAt,
    updatedAt: userFound.updatedAt,
  });
};

export const updateProfile = async (req, res) => {
  try {
    const { name, lastname, username, email } = req.body;

    // Validación básica
    if (!name || !lastname || !username || !email) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Verificar si el username o email ya existen en otro usuario
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
      _id: { $ne: req.user.id }
    });

    if (existingUser) {
      return res.status(400).json({ message: "El correo o nombre de usuario ya están registrados" });
    }

    // Actualizar el usuario
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        lastname,
        username,
        email,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({
      message: "Perfil actualizado correctamente",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        lastname: updatedUser.lastname,
        username: updatedUser.username,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cambiar gym activo del usuario
export const changeActiveGym = async (req, res) => {
  try {
    const { gymId } = req.body;
    
    // Verificar que el gym pertenece al usuario
    const gym = await Gym.findOne({ _id: gymId, user_id: req.user.id });
    
    if (!gym) {
      return res.status(400).json({ message: "Gimnasio no válido o no tienes permisos" });
    }
    
    // Actualizar el gym activo del usuario
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { active_gym_id: gymId },
      { new: true }
    );
    
    res.json({
      message: "Gym activo cambiado correctamente",
      activeGym: gym
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener información completa del usuario (incluyendo gyms)
export const getUserInfo = async (req, res) => {
  try {
    console.log('🔄 Obteniendo información del usuario...');
    console.log('👤 Usuario ID:', req.user.id);
    
    const userFound = await User.findById(req.user.id);
    if (!userFound) {
      console.log('❌ Usuario no encontrado');
      return res.status(400).json({ message: "Usuario no encontrado" });
    }
    
    // Obtener todos los gyms del usuario
    const userGyms = await Gym.find({ user_id: req.user.id });
    console.log('🏋️ Gyms del usuario:', userGyms.length);
    
    // Obtener el gym activo
    let activeGym = null;
    if (userFound.active_gym_id) {
      console.log('🎯 Gym activo ID:', userFound.active_gym_id);
      activeGym = await Gym.findById(userFound.active_gym_id);
      
      // Si hay gym activo, cargar sus membresías y clientes
      if (activeGym) {
        console.log('✅ Gym activo encontrado:', activeGym.name);
        const Membership = (await import("../models/membership.js")).default;
        const Customer = (await import("../models/customer.js")).default;
        
        // Cargar membresías del gym activo
        const memberships = await Membership.find({ gym_id: activeGym._id });
        console.log('📋 Membresías encontradas:', memberships.length);
        activeGym = activeGym.toObject();
        activeGym.memberships = memberships;
        
        // Cargar clientes del gym activo
        const customers = await Customer.find({ gym_id: activeGym._id }).populate('membership_id');
        console.log('👥 Clientes encontrados:', customers.length);
        console.log('📊 Detalles de clientes:', customers.map(c => ({
          name: c.name,
          membership: c.membership_id ? c.membership_id.nombre : 'Sin membresía',
          status: c.status
        })));
        activeGym.customers = customers;
      } else {
        console.log('❌ Gym activo no encontrado');
      }
    } else {
      console.log('❌ No hay gym activo configurado');
    }
    
    const response = {
      user: {
        id: userFound._id,
        name: userFound.name,
        lastname: userFound.lastname,
        username: userFound.username,
        email: userFound.email,
        active_gym_id: userFound.active_gym_id,
        createdAt: userFound.createdAt,
        updatedAt: userFound.updatedAt,
      },
      gyms: userGyms,
      activeGym: activeGym
    };
    
    console.log('📤 Enviando respuesta con:', {
      user: response.user.name,
      gymsCount: response.gyms.length,
      activeGym: activeGym ? activeGym.name : 'No hay gym activo',
      membershipsCount: activeGym ? activeGym.memberships.length : 0,
      customersCount: activeGym ? activeGym.customers.length : 0
    });
    
    return res.json(response);
  } catch (error) {
    console.log('❌ Error en getUserInfo:', error);
    res.status(500).json({ message: error.message });
  }
};

// Eliminar usuario autenticado
export const deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
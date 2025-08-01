import Gym from "../models/gym.js";
import Membership from "../models/membership.js";
import Customer from "../models/customer.js";

// Función para validar formato "HH:mm"
const isValidTime = (time) => {
  return /^([0-1]\d|2[0-3]):([0-5]\d)$/.test(time);
};

// Crear un gimnasio
export const createGym = async (req, res) => {
  try {
    const { opening_time, closing_time, name, country, city, address } = req.body;

    // Validación de horas
    if (!isValidTime(opening_time) || !isValidTime(closing_time)) {
      return res.status(400).json({
        message: "Las horas deben tener el formato HH:mm (por ejemplo: 08:00, 18:30).",
      });
    }

    // Crea el gym con user_id asignado desde el usuario autenticado
    const gym = new Gym({
      name,
      country,
      city,
      address,
      opening_time,
      closing_time,
      user_id: req.user.id, // <--- Aquí asignas el user autenticado
    });

    await gym.save();
    res.status(201).json(gym);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Obtener todos los gimnasios de un usuario
export const getGymsByUser = async (req, res) => {
  try {
    const gyms = await Gym.find({ user_id: req.user.id }).populate("user_id", "name email");
    res.json(gyms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Obtener el gimnasio de un usuario
export const getGymByUser = async (req, res) => {
  try {
    const gym = await Gym.findOne({ user_id: req.user.id });
    if (!gym) return res.status(404).json({ message: "No tienes un gimnasio creado" });
    res.json(gym);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Obtener todos los gimnasios
export const getAllGyms = async (req, res) => {
  try {
    const gyms = await Gym.find().populate("user_id", "name email");
    res.json(gyms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Obtener un gimnasio por ID
export const getGymById = async (req, res) => {
  try {
    const gym = await Gym.findById(req.params.id).populate("user_id", "name email");
    if (!gym) return res.status(404).json({ message: "Gimnasio no encontrado" });
    res.json(gym);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Actualizar un gimnasio
export const updateGym = async (req, res) => {
  try {
    const { opening_time, closing_time } = req.body;

    // Validación de horas si vienen en la actualización
    if (opening_time && !isValidTime(opening_time)) {
      return res.status(400).json({
        message: "La hora de apertura no tiene un formato válido (HH:mm).",
      });
    }

    if (closing_time && !isValidTime(closing_time)) {
      return res.status(400).json({
        message: "La hora de cierre no tiene un formato válido (HH:mm).",
      });
    }

    const updatedGym = await Gym.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedGym) return res.status(404).json({ message: "Gimnasio no encontrado" });
    res.json(updatedGym);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Eliminar un gimnasio con cascade (eliminar membresías y clientes relacionados)
export const deleteGym = async (req, res) => {
  try {
    const gymId = req.params.id;
    
    // Verificar que el gym pertenece al usuario
    const gym = await Gym.findOne({ _id: gymId, user_id: req.user.id });
    if (!gym) return res.status(404).json({ message: "Gimnasio no encontrado" });

    // Eliminar todas las membresías del gym
    await Membership.deleteMany({ gym_id: gymId });
    
    // Eliminar todos los clientes que tengan membresías de este gym
    const memberships = await Membership.find({ gym_id: gymId });
    const membershipIds = memberships.map(m => m._id);
    await Customer.deleteMany({ membership_id: { $in: membershipIds } });
    
    // Finalmente eliminar el gym
    await Gym.findByIdAndDelete(gymId);
    
    res.json({ message: "Gimnasio eliminado correctamente junto con sus membresías y clientes" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

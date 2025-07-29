import Membership from "../models/membership.js";
import Gym from "../models/gym.js";

// ✅ Crear una membresía
export const createMembership = async (req, res) => {
  try {
    console.log('🔄 Creando membresía...');
    console.log('📝 Datos recibidos:', req.body);
    console.log('👤 Usuario:', req.user.id);
    
    // Verificar que el gym_id pertenece al usuario autenticado
    const gym = await Gym.findOne({ _id: req.body.gym_id, user_id: req.user.id });
    if (!gym) {
      console.log('❌ Gym no válido o no tienes permisos');
      return res.status(400).json({ message: "Gimnasio no válido o no tienes permisos" });
    }
    
    console.log('✅ Gym válido encontrado:', gym.name);
    
    const membership = new Membership(req.body);
    await membership.save();
    
    console.log('✅ Membresía creada exitosamente:', membership._id);
    res.status(201).json(membership);
  } catch (error) {
    console.log('❌ Error al crear membresía:', error);
    res.status(400).json({ message: error.message });
  }
};

// ✅ Obtener todas las membresías del usuario autenticado (filtradas por sus gyms)
export const getAllMemberships = async (req, res) => {
  try {
    // Obtener todos los gyms del usuario
    const userGyms = await Gym.find({ user_id: req.user.id });
    const gymIds = userGyms.map(gym => gym._id);
    
    // Filtrar membresías por gym_id del usuario
    const memberships = await Membership.find({ 
      gym_id: { $in: gymIds } 
    }).populate("gym_id", "name");
    
    res.json(memberships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Obtener membresías por gym específico
export const getMembershipsByGym = async (req, res) => {
  try {
    const { gymId } = req.params;
    console.log('🔍 Buscando membresías para gym:', gymId);
    console.log('👤 Usuario:', req.user.id);
    
    // Verificar que el gym pertenece al usuario
    const gym = await Gym.findOne({ _id: gymId, user_id: req.user.id });
    if (!gym) {
      console.log('❌ Gym no encontrado o no pertenece al usuario');
      return res.status(400).json({ message: "Gimnasio no válido o no tienes permisos" });
    }
    
    console.log('✅ Gym válido encontrado:', gym.name);
    
    const memberships = await Membership.find({ gym_id: gymId }).populate("gym_id", "name");
    console.log('📊 Membresías encontradas:', memberships.length);
    
    res.json(memberships);
  } catch (error) {
    console.log('❌ Error en getMembershipsByGym:', error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Obtener una membresía por ID
export const getMembershipById = async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id).populate("gym_id", "name");
    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }
    
    // Verificar que el gym de la membresía pertenece al usuario
    const gym = await Gym.findOne({ _id: membership.gym_id, user_id: req.user.id });
    if (!gym) {
      return res.status(403).json({ message: "No tienes permisos para ver esta membresía" });
    }
    
    res.json(membership);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Actualizar una membresía
export const updateMembership = async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id);
    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }
    
    // Verificar que el gym de la membresía pertenece al usuario
    const gym = await Gym.findOne({ _id: membership.gym_id, user_id: req.user.id });
    if (!gym) {
      return res.status(403).json({ message: "No tienes permisos para actualizar esta membresía" });
    }
    
    const updated = await Membership.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Eliminar una membresía
export const deleteMembership = async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id);
    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }
    
    // Verificar que el gym de la membresía pertenece al usuario
    const gym = await Gym.findOne({ _id: membership.gym_id, user_id: req.user.id });
    if (!gym) {
      return res.status(403).json({ message: "No tienes permisos para eliminar esta membresía" });
    }
    
    const deleted = await Membership.findByIdAndDelete(req.params.id);
    res.json({ message: "Membership deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

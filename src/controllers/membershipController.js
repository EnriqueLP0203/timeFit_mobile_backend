import Membership from "../models/membership.js";

// ✅ Crear una membresía
export const createMembership = async (req, res) => {
  try {
    const membership = new Membership(req.body);
    await membership.save();
    res.status(201).json(membership);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Obtener todas las membresías (opcional: filtrar por gym_id)
export const getAllMemberships = async (req, res) => {
  try {
    const filter = {};
    if (req.query.gym_id) {
      filter.gym_id = req.query.gym_id;
    }

    const memberships = await Membership.find(filter).populate("gym_id", "name");
    res.json(memberships);
  } catch (error) {
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
    res.json(membership);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Actualizar una membresía
export const updateMembership = async (req, res) => {
  try {
    const updated = await Membership.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Membership not found" });
    }
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ✅ Eliminar una membresía
export const deleteMembership = async (req, res) => {
  try {
    const deleted = await Membership.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Membership not found" });
    }
    res.json({ message: "Membership deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

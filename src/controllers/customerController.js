 import Customer from "../models/customer.js";

// Verifica si el cliente aún tiene membresía activa
const checkMembershipStatus = (customer) => {
  const today = new Date();
  return customer.end_date < today ? "inactive" : "active";
};

// Crear nuevo cliente
export const createCustomer = async (req, res) => {
  try {
    const status = checkMembershipStatus(req.body);
    const customer = new Customer({ ...req.body, status });
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtener todos los clientes
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().populate("membership_id", "nombre precio");
    const updated = customers.map((c) => {
      c.status = checkMembershipStatus(c);
      return c;
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener cliente por ID
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate("membership_id", "nombre precio");
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    customer.status = checkMembershipStatus(customer);
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar cliente
export const updateCustomer = async (req, res) => {
  try {
    const status = checkMembershipStatus(req.body);

    const updated = await Customer.findByIdAndUpdate(
      req.params.id,
      { ...req.body, status },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ message: "Customer not found" });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Eliminar cliente
export const deleteCustomer = async (req, res) => {
  try {
    const deleted = await Customer.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Customer not found" });

    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

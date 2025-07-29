import Customer from "../models/customer.js";
import Membership from "../models/membership.js";
import Gym from "../models/gym.js";

// Verifica si el cliente aún tiene membresía activa
const checkMembershipStatus = (customer) => {
  const today = new Date();
  return customer.end_date < today ? "inactive" : "active";
};

// Función para calcular la edad
const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Crear nuevo cliente
export const createCustomer = async (req, res) => {
  try {
    console.log('🔄 Creando cliente...');
    console.log('📝 Datos recibidos:', req.body);
    console.log('👤 Usuario:', req.user.id);
    
    // Verificar que la membresía pertenece a un gym del usuario
    const membership = await Membership.findById(req.body.membership_id);
    if (!membership) {
      console.log('❌ Membresía no encontrada');
      return res.status(400).json({ message: "Membresía no encontrada" });
    }
    
    const gym = await Gym.findOne({ _id: membership.gym_id, user_id: req.user.id });
    if (!gym) {
      console.log('❌ No tienes permisos para crear clientes en esta membresía');
      return res.status(400).json({ message: "No tienes permisos para crear clientes en esta membresía" });
    }
    
    // Validar edad mínima de 18 años
    if (req.body.birth_date) {
      const age = calculateAge(req.body.birth_date);
      if (age < 18) {
        console.log('❌ Cliente menor de 18 años');
        return res.status(400).json({ message: "El cliente debe tener al menos 18 años" });
      }
    }
    
    // Verificar campos de contacto de emergencia
    if (!req.body.emergency_contact || !req.body.emergency_contact.name || !req.body.emergency_contact.phone) {
      console.log('❌ Campos de contacto de emergencia faltantes');
      return res.status(400).json({ message: "Los campos de contacto de emergencia son obligatorios" });
    }
    
    // Calcular automáticamente la fecha de fin basada en la duración de la membresía
    let customerData = { ...req.body };
    
    // Asegurar que el gym_id se guarde correctamente
    customerData.gym_id = membership.gym_id;
    
    if (req.body.start_date && membership.duracion) {
      const startDate = new Date(req.body.start_date);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + membership.duracion);
      customerData.end_date = endDate;
    }
    
    console.log('📋 Datos finales del cliente:', customerData);
    
    const status = checkMembershipStatus(customerData);
    const customer = new Customer({ ...customerData, status });
    await customer.save();
    
    console.log('✅ Cliente creado exitosamente:', customer._id);
    console.log('🏋️ Gym ID guardado:', customer.gym_id);
    res.status(201).json(customer);
  } catch (error) {
    console.log('❌ Error al crear cliente:', error);
    res.status(400).json({ message: error.message });
  }
};

// Obtener todos los clientes del usuario (filtrados por sus gyms)
export const getAllCustomers = async (req, res) => {
  try {
    // Obtener todos los gyms del usuario
    const userGyms = await Gym.find({ user_id: req.user.id });
    const gymIds = userGyms.map(gym => gym._id);
    
    // Obtener todas las membresías de los gyms del usuario
    const memberships = await Membership.find({ gym_id: { $in: gymIds } });
    const membershipIds = memberships.map(m => m._id);
    
    // Filtrar clientes por membresías del usuario
    const customers = await Customer.find({ 
      membership_id: { $in: membershipIds } 
    }).populate("membership_id", "nombre precio");
    
    const updated = customers.map((c) => {
      c.status = checkMembershipStatus(c);
      return c;
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener clientes por gym específico
export const getCustomersByGym = async (req, res) => {
  try {
    const { gymId } = req.params;
    
    // Verificar que el gym pertenece al usuario
    const gym = await Gym.findOne({ _id: gymId, user_id: req.user.id });
    if (!gym) {
      return res.status(400).json({ message: "Gimnasio no válido o no tienes permisos" });
    }
    
    // Obtener membresías del gym
    const memberships = await Membership.find({ gym_id: gymId });
    const membershipIds = memberships.map(m => m._id);
    
    // Obtener clientes de esas membresías
    const customers = await Customer.find({ 
      membership_id: { $in: membershipIds } 
    }).populate("membership_id", "nombre precio");
    
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

    // Verificar que la membresía del cliente pertenece a un gym del usuario
    const membership = await Membership.findById(customer.membership_id._id);
    if (!membership) {
      return res.status(404).json({ message: "Membresía no encontrada" });
    }
    
    const gym = await Gym.findOne({ _id: membership.gym_id, user_id: req.user.id });
    if (!gym) {
      return res.status(403).json({ message: "No tienes permisos para ver este cliente" });
    }

    customer.status = checkMembershipStatus(customer);
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar cliente
export const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    // Verificar que la membresía del cliente pertenece a un gym del usuario
    const membership = await Membership.findById(customer.membership_id);
    if (!membership) {
      return res.status(404).json({ message: "Membresía no encontrada" });
    }
    
    const gym = await Gym.findOne({ _id: membership.gym_id, user_id: req.user.id });
    if (!gym) {
      return res.status(403).json({ message: "No tienes permisos para actualizar este cliente" });
    }
    
    // Validar edad mínima de 18 años si se está actualizando la fecha de nacimiento
    if (req.body.birth_date) {
      const age = calculateAge(req.body.birth_date);
      if (age < 18) {
        return res.status(400).json({ message: "El cliente debe tener al menos 18 años" });
      }
    }
    
    // Calcular automáticamente la fecha de fin si se está actualizando la fecha de inicio
    let updateData = { ...req.body };
    
    if (req.body.start_date && membership.duracion) {
      const startDate = new Date(req.body.start_date);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + membership.duracion);
      updateData.end_date = endDate;
    }
    
    const status = checkMembershipStatus(updateData);

    const updated = await Customer.findByIdAndUpdate(
      req.params.id,
      { ...updateData, status },
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Eliminar cliente
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    
    // Verificar que la membresía del cliente pertenece a un gym del usuario
    const membership = await Membership.findById(customer.membership_id);
    if (!membership) {
      return res.status(404).json({ message: "Membresía no encontrada" });
    }
    
    const gym = await Gym.findOne({ _id: membership.gym_id, user_id: req.user.id });
    if (!gym) {
      return res.status(403).json({ message: "No tienes permisos para eliminar este cliente" });
    }

    const deleted = await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Migrar clientes existentes que no tienen gym_id
export const migrateCustomers = async (req, res) => {
  try {
    console.log('🔄 Iniciando migración de clientes...');
    
    // Obtener todos los clientes que no tienen gym_id
    const customersWithoutGym = await Customer.find({ gym_id: { $exists: false } });
    console.log('📊 Clientes sin gym_id encontrados:', customersWithoutGym.length);
    
    let migratedCount = 0;
    
    for (const customer of customersWithoutGym) {
      try {
        // Obtener la membresía del cliente
        const membership = await Membership.findById(customer.membership_id);
        if (membership && membership.gym_id) {
          // Actualizar el cliente con el gym_id de su membresía
          await Customer.findByIdAndUpdate(customer._id, { gym_id: membership.gym_id });
          migratedCount++;
          console.log(`✅ Cliente ${customer.name} migrado al gym ${membership.gym_id}`);
        } else {
          console.log(`❌ Cliente ${customer.name} no tiene membresía válida`);
        }
      } catch (error) {
        console.log(`❌ Error migrando cliente ${customer.name}:`, error.message);
      }
    }
    
    console.log(`✅ Migración completada. ${migratedCount} clientes migrados.`);
    res.json({ 
      message: `Migración completada. ${migratedCount} clientes migrados.`,
      migratedCount 
    });
  } catch (error) {
    console.log('❌ Error en migración:', error);
    res.status(500).json({ message: error.message });
  }
};

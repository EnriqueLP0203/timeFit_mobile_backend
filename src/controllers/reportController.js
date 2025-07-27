import Report from "../models/report.js";

//Crear un reporte
export const createReport = async (req, res) => {
  try {
    const { title, description } = req.body;

    const report = new Report({
      title,
      description,
      user_id: req.user.id, // ← viene del token JWT
    });

    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


//Obtener todos los reportes
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().populate("user_id", "first_name last_name email");
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener un reporte por ID
export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate("user_id", "first_name last_name email");
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cambiar el estado del reporte
export const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "attended"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updated = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Eliminar un reporte
export const deleteReport = async (req, res) => {
  try {
    const deleted = await Report.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json({ message: "Report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

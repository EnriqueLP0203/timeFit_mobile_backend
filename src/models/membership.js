import mongoose from "mongoose";

const membershipSchema = new mongoose.Schema(
  {
    gym_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gym",
      required: true,
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
    },
    precio: {
      type: Number,
      required: true,
      min: 0,
    },
    duracion: {
      type: Number, 
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["activo", "inactivo"],
      default: "activo",
    },
    color: {
      type: String, 
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Membership", membershipSchema);

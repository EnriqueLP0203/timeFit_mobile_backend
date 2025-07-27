import mongoose from "mongoose";

const gymSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    country: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    opening_time: {
      type: String, // formato esperado: "HH:mm"
      required: true,
      trim: true,
      validate: {
        validator: function (value) {
          return /^([0-1]\d|2[0-3]):([0-5]\d)$/.test(value); // Validación de hora 24h
        },
        message: props => `${props.value} no es una hora válida (formato HH:mm)`,
      },
    },
    closing_time: {
      type: String, // formato esperado: "HH:mm"
      required: true,
      trim: true,
      validate: {
        validator: function (value) {
          return /^([0-1]\d|2[0-3]):([0-5]\d)$/.test(value); // Validación de hora 24h
        },
        message: props => `${props.value} no es una hora válida (formato HH:mm)`,
      },
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Gym", gymSchema);

import mongoose from 'mongoose'

const reportSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },

    description:{
        type: String,
        required: true

    },

    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },

    status:{
    type: String,
    enum: ["pending", "attended"],
    default: "pending",
    }

}, {
    timestamps: true
});

export default mongoose.model("Report", reportSchema)
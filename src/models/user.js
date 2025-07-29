import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required : true,
        trim: true
    },

    lastname: {
        type: String,
        required : true,
        trim: true       
    },

    username:{
        type: String,
        required : true,
        trim: true,
        unique: true
    },

    email:{
        type:String,
        required: true,
        trim: true,
        unique: true,
    },

    password:{
        type:String,
        required: true
    },

    active_gym_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "gym",
        default: null
    }

}, {
    timestamps: true

});

export default mongoose.model('User', userSchema)
const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['viewer', 'creator', 'admin'],
        default: 'viewer'
    },
    profilePic: {
        type: String,
    },
    bio: {
        type: String,
        max: 500
    },
    subscribers: {
        type: Number,
        default: 0
    },
    subscriptions: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    // subscribedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdAt: {
        type: Date,
        default: Date.now
    }
})
const UserModel=mongoose.model('user',UserSchema);
module.exports=UserModel;
const mongoose = require('mongoose');
const SubscriptionSchema =new mongoose.Schema({
    subscriberId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    channelId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    createdAt: { type: Date, default: Date.now }
})
const SubscriptionModel = mongoose.model('subscription', SubscriptionSchema);
module.exports = SubscriptionModel;
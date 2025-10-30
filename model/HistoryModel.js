const mongoose = require('mongoose');
const HistorySchema=new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:'user'},
    videoId:{type:mongoose.Schema.Types.ObjectId,ref:'video'},
    watchedAt:{type:Date,default:Date.now},
    progress:{type:Number,default:0}
})
const HistoryModel=mongoose.model('history',HistorySchema);
module.exports=HistoryModel;
const mongoose = require('mongoose');
const PlayListSchema=new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:'user'},
    name:{type:String,required:true},
    videos:[{type:mongoose.Schema.Types.ObjectId,ref:'video'}],
    isPublic:{type:Boolean,default:false},
    createdAt:{type:Date,default:Date.now}
})
const PlayListModel=mongoose.model('playlist',PlayListSchema);
module.exports=PlayListModel;
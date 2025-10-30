const e = require('express');
const UserModel=require('../model/UserModel');
const VideoModel=require('../model/VideoModel');
const SubscriptionModel=require('../model/SubscriptionModel');
const bcrypt=require('bcrypt');
const fs=require('fs');
const path=require('path');
const jwt=require('jsonwebtoken');
exports.registerUser=async (req,res)=>{
    const {username,email,password,role}=req.body;
    if(!username || !email || !password){
        return res.json({'message':'Please Fill All Fields'})
    }else{
        let newPassword=await bcrypt.hashSync(password,10);
        const user=await UserModel.create({
            username,
            email,
            password:newPassword,
            role:role
        })
        if(user){
            return res.json({'message':'User Created Successfully'});
        }else{
            return res.json({'message':'Something Went Wrong'});
        }
    }
}
exports.loginUser=async (req,res)=>{
    const {email,password}=req.body;
    if(!email || !password){
        return res.json({'message':'email and password required'})
    }else{
        const user=await UserModel.findOne({email:email});
        if(!user){
            return res.json({'message':'Invalid Email'});
        }else{
            const matchPassword=await bcrypt.compareSync(password,user.password);
            if(!matchPassword){
                return res.json({'message':'Invalid Credentials'})
            }else{
                const token = jwt.sign({ userId: user._id }, "secretkey", { expiresIn: "1h" });
                return res.json({user,token});
            }
        }
    }
}
exports.uploadVideo=async (req,res)=>{
    const body=req.body;
    if(!body.title || !body.uploader){
        return res.json({'message':'Please Fill All Required Fields'});
    }else{
        const videoFile = req.files['video'] ? req.files['video'][0].path : '';
        const thumbnailFile = req.files['thumbnail'] ? req.files['thumbnail'][0].path : '';
        const videoData=await VideoModel.create({
            title:body.title,
            description:body.description,
            tags:body.tags ? body.tags.split(',') : [],
            uploader:body.uploader,
            videoUrl:videoFile,
            thumbnailUrl:thumbnailFile,
            duration:body.duration,
            status:body.status
        })
        if(videoData){
            return res.json({'message':'Video Uploaded Successfully'});
        }else{
            return res.json({'message':'Something Went Wrong'});
        }
    }
}
exports.getAllVideos = async (req, res) => {
  try {
    const videos = await VideoModel.find()
      .populate("uploader", "username email role") // show uploader info
      .populate("comments.userId", "username email") // show commenter info
      .sort({ createdAt: -1 });
    console.log(videos);
    if (!videos || videos.length === 0) {
      return res.json({ message: "No videos found" });
    }

    return res.json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return res.status(500).json({ message: "Something went wrong", error });
  }
};

exports.getVideoByUserId=async (req,res)=>{
    const userId=req.params.userId;
    const videos=await VideoModel.find({uploader:userId}).populate('uploader','username email role').sort({createdAt:-1});
    if(videos){
        return res.json(videos);
    }else{
        return res.json({'message':'Something Went Wrong'});
    }
}
exports.likeVideo = async (req, res) => {
  try {
    const videoId = req.params.videoId;
    const { userId } = req.body;

    if (!userId) return res.json({ message: "User ID is required" });

    const video = await VideoModel.findById(videoId);
    if (!video) return res.json({ message: "Video not found" });

    // --- If user already liked, undo like ---
    const likeIndex = video.likes.findIndex(like => like.userId.toString() === userId);
    if (likeIndex !== -1) {
      video.likes.splice(likeIndex, 1); // remove the like
      await video.save();
      return res.json({ message: "Like removed successfully" });
    }

    // --- If user disliked before, remove that dislike ---
    const dislikeIndex = video.dislikes.findIndex(dislike => dislike.userId.toString() === userId);
    if (dislikeIndex !== -1) {
      video.dislikes.splice(dislikeIndex, 1);
    }

    // --- Add new like ---
    video.likes.push({ userId });
    await video.save();

    return res.json({ message: "Video liked successfully" });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.dislikeVideo=async (req,res)=>{
    const videoId=req.params.videoId;
    const {userId}=req.body;
    if(!userId){
        return res.json({'message':'User ID is required'});
    }
    const video=await VideoModel.findById(videoId);
    if(!video){
        return res.json({'message':'Video not found'});
    }
    const alreadyDisliked=video.dislikes.find(dislike=>dislike.userId.toString()===userId);
    if(alreadyDisliked){
        return res.json({'message':'You have already disliked this video'});
    }
    video.dislikes.push({userId});
    // Remove like if exists
    video.likes=video.likes.filter(like=>like.userId.toString()!==userId);
    await video.save();
    return res.json({'message':'Video disliked successfully'});
}
exports.commentVideo=async (req,res)=>{
    const videoId=req.params.videoId;
    const {text,userId}=req.body;
    if(!text || !userId){
        return res.json({'message':'Text and User ID are required'});
    }
    const video=await VideoModel.findById(videoId);
    if(!video){
        return res.json({'message':'Video not found'});
    }
    video.comments.push({userId,text});
    await video.save();
    return res.json({'message':'Comment added successfully'});
}
// ================= SUBSCRIBE ==================
exports.subscribe = async (req, res) => {
  try {
    const subscriberId = req.body.userId; // person subscribing
    const channelId = req.params.channelId; // channel being subscribed to

    if (!subscriberId || !channelId) {
      return res.json({ message: "Subscriber ID and Channel ID are required" });
    }

    if (subscriberId === channelId) {
      return res.json({ message: "You cannot subscribe to yourself" });
    }

    const existing = await SubscriptionModel.findOne({ subscriberId, channelId });
    if (existing) {
      return res.json({ message: "Already subscribed" });
    }

    // Add to subscription collection
    const newSub = new SubscriptionModel({ subscriberId, channelId });
    await newSub.save();

    // Update counts and lists
    await UserModel.findByIdAndUpdate(channelId, { $inc: { subscribers: 1 } });
    await UserModel.findByIdAndUpdate(subscriberId, { $addToSet: { subscriptions: channelId } });

    res.json({ message: "Subscribed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= UNSUBSCRIBE ==================
exports.unsubscribe = async (req, res) => {
  try {
    const subscriberId = req.body.userId;
    const channelId = req.params.channelId;

    if (!subscriberId || !channelId) {
      return res.json({ message: "Subscriber ID and Channel ID are required" });
    }

    const existing = await SubscriptionModel.findOneAndDelete({ subscriberId, channelId });
    if (!existing) {
      return res.json({ message: "Not subscribed yet" });
    }

    // Decrement count and update lists
    await UserModel.findByIdAndUpdate(channelId, { $inc: { subscribers: -1 } });
    await UserModel.findByIdAndUpdate(subscriberId, { $pull: { subscriptions: channelId } });

    res.json({ message: "Unsubscribed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.deleteVideo = async (req, res) => {
  try {
    const id = req.params.id;
    const video = await VideoModel.findById(id);
    // Define file paths properly
    const videoPath = path.join(__dirname, '..', 'uploads', 'videos', video.videoUrl);
    const thumbnailPath = path.join(__dirname, '..', 'uploads', 'thumbnails', video.thumbnailUrl);
    // Delete video file if it exists
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }
    // Delete thumbnail file if it exists
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
    }
    // Delete record from DB
    await VideoModel.findByIdAndDelete(id);
    return res.json({ message: 'Video Deleted Successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error deleting video', error: err.message });
  }
};
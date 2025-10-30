const mongoose = require("mongoose");

const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  tags: { type: [String], default: [] },
  uploader: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  videoUrl: { type: String, required: true },
  thumbnailUrl: { type: String, required: true },
  views: { type: Number, default: 0 },
  likes: { type: [{ userId: mongoose.Schema.Types.ObjectId }], default: [] },
  dislikes: { type: [{ userId: mongoose.Schema.Types.ObjectId }], default: [] },
  comments: {
    type: [
      { userId:{ type: mongoose.Schema.Types.ObjectId, ref: "user" }, text: String, createdAt: { type: Date, default: Date.now } }
    ],
    default: [],
  },
  duration: { type: String, required: true },
  status: { type: String, enum: ["public", "private", "unlisted"], default: "public" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const VideoModel = mongoose.model("video", VideoSchema);
module.exports = VideoModel;

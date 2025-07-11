import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  public_id: { type: String, required: true }, // Add public_id for Cloudinary deletion
  title: { type: String },
  tags: [{ type: String }],
  category: { type: String }, // Added category field for folder name
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Image', imageSchema);

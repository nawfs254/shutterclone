import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Image from './models/Image.js';
import registerCloudinaryFoldersRoute from './cloudinaryFolders.js';
import cloudinary from 'cloudinary';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/shutterclone';

app.use(cors());
app.use(express.json());

// Simple test route
app.get('/', (req, res) => {
  res.send('Express server is running!');
});

// Add a new image
app.post('/api/images', async (req, res) => {
  try {
    const { url, public_id, title, tags, category } = req.body; // Accept public_id
    const image = new Image({ url, public_id, title, tags, category }); // Save public_id
    await image.save();
    res.status(201).json(image);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save image' });
  }
});

// Search images by tag or title
app.get('/api/images', async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    let filter = {};
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { tags: { $elemMatch: { $regex: search, $options: 'i' } } }
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [images, total] = await Promise.all([
      Image.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Image.countDocuments(filter)
    ]);
    res.json({ images, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// DELETE image (from Cloudinary and MongoDB)
app.delete('/api/images/:id', async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ error: 'Image not found' });
    // Delete from Cloudinary
    await cloudinary.v2.uploader.destroy(image.public_id);
    // Delete from MongoDB
    await image.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete image', details: err.message });
  }
});

// UPDATE image metadata
app.put('/api/images/:id', async (req, res) => {
  try {
    const { title, tags, category } = req.body;
    const image = await Image.findByIdAndUpdate(
      req.params.id,
      { title, tags, category },
      { new: true }
    );
    if (!image) return res.status(404).json({ error: 'Image not found' });
    res.json(image);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update image', details: err.message });
  }
});

// Register Cloudinary folders route
registerCloudinaryFoldersRoute(app);

// Connect to MongoDB and start server
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

app.get('/api/images/category/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const images = await Image.find({ category: new RegExp(`^${category}$`, 'i') }).sort({ createdAt: -1 });
    res.json(images);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch images by category' });
  }
});

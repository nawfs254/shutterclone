import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import cloudinary from 'cloudinary';
import mongoose from 'mongoose';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Cloudinary config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// MongoDB Image schema
const imageSchema = new mongoose.Schema({
  url: String,
  public_id: String,
  title: String,
  tags: [String],
  category: String,
  createdAt: { type: Date, default: Date.now },
});
const Image = mongoose.model('Image', imageSchema);

const HF_TOKEN = process.env.HF_TOKEN;

// Placeholder AI tag generator
async function generateTagsAI(imagePath) {
  try {
    const imageData = fs.readFileSync(imagePath, { encoding: 'base64' });
    const response = await axios({
      method: 'POST',
      url: 'https://api-inference.huggingface.co/models/google/vit-base-patch16-224',
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({
        inputs: imageData,
      }),
      responseType: 'json',
    });
    // The response will contain tags/labels
    if (Array.isArray(response.data)) {
      // Some models return an array of objects with 'label' and 'score'
      return response.data.map(obj => obj.label.toLowerCase());
    } else if (response.data?.[0]?.label) {
      return [response.data[0].label.toLowerCase()];
    } else {
      return ['unknown'];
    }
  } catch (err) {
    console.error('AI tag generation failed:', err.message);
    return ['unknown'];
  }
}

// Recursively get all image files in subfolders
function getAllImages(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllImages(filePath));
    } else if (/(jpe?g|png|gif|bmp)$/i.test(file)) {
      results.push(filePath);
    }
  });
  return results;
}

async function main() {
  // Connect to MongoDB
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const baseDir = __dirname;
  const folders = fs.readdirSync(baseDir).filter(f => fs.statSync(path.join(baseDir, f)).isDirectory());

  for (const folder of folders) {
    const folderPath = path.join(baseDir, folder);
    const images = getAllImages(folderPath);
    for (const imgPath of images) {
      const title = path.basename(imgPath);
      const category = folder;
      const tags = await generateTagsAI(imgPath);
      try {
        const uploadRes = await cloudinary.v2.uploader.upload(imgPath, {
          folder: category,
        });
        const imageDoc = new Image({
          url: uploadRes.secure_url,
          public_id: uploadRes.public_id,
          title,
          tags,
          category,
        });
        await imageDoc.save();
        console.log(`Uploaded and saved: ${title} | Tags: ${tags.join(', ')}`);
      } catch (err) {
        console.error(`Failed for ${imgPath}:`, err.message);
      }
    }
  }
  mongoose.disconnect();
  console.log('Done!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  mongoose.disconnect();
}); 
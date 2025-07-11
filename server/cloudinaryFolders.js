import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default function registerCloudinaryFoldersRoute(app) {
  // Fetch all folders from Cloudinary
  app.get('/api/folders', async (req, res) => {
    try {
      const result = await cloudinary.v2.api.root_folders();
      if (!result.folders) {
        console.error('Cloudinary API response:', result);
        return res.status(500).json({ error: 'No folders found in Cloudinary response' });
      }
      res.json(result.folders.map(f => f.name));
    } catch (err) {
      console.error('Cloudinary folder fetch error:', err);
      res.status(500).json({ error: 'Failed to fetch folders', details: err.message });
    }
  });
}

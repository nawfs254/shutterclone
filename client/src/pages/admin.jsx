import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function Admin() {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [folders, setFolders] = useState([]);
  const [folder, setFolder] = useState("");
  const [customFolder, setCustomFolder] = useState("");
  const [useCustomFolder, setUseCustomFolder] = useState(false);
  const [images, setImages] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ title: '', tags: '', category: '' });
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Replace with your Cloudinary unsigned upload preset and cloud name
  const CLOUDINARY_UPLOAD_PRESET = "ShutterClone";
  const CLOUDINARY_CLOUD_NAME = "dsxlsypxk";

  useEffect(() => {
    fetch("http://localhost:5000/api/folders")
      .then((res) => res.json())
      .then((data) => setFolders(data))
      .catch(() => setFolders([]));
    fetchImages();
  }, []);

  // Search/filter effect
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search.trim() === "") {
        fetchImages();
      } else {
        fetchImages({ search });
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const fetchImages = (params = {}) => {
    setLoading(true);
    const query = new URLSearchParams(params).toString();
    fetch(`http://localhost:5000/api/images${query ? `?${query}` : ""}`)
      .then((res) => res.json())
      .then((data) => setImages(data.images))
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  };

  const handleFolderChange = (e) => {
    if (e.target.value === "__custom__") {
      setUseCustomFolder(true);
      setFolder("");
    } else {
      setUseCustomFolder(false);
      setFolder(e.target.value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMessage("");
    try {
      // 1. Upload image to Cloudinary
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      const folderToUse = useCustomFolder ? customFolder : folder;
      if (folderToUse) formData.append("folder", folderToUse);
      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const cloudinaryData = await cloudinaryRes.json();
      if (!cloudinaryData.secure_url) throw new Error("Cloudinary upload failed");

      // 2. Save metadata to your backend
      const res = await fetch("http://localhost:5000/api/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: cloudinaryData.secure_url,
          public_id: cloudinaryData.public_id, // Send public_id
          title,
          tags: tags.split(",").map((t) => t.trim()),
          category: folderToUse, // Add category field
        }),
      });
      if (!res.ok) throw new Error("Failed to save image metadata");
      setMessage("Image uploaded and saved successfully!");
      setTitle("");
      setTags("");
      setImageFile(null);
      setCustomFolder("");
      setUseCustomFolder(false);
      setFolder("");
      setShowModal(false);
      fetchImages();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    await fetch(`http://localhost:5000/api/images/${id}`, { method: "DELETE" });
    fetchImages();
  };

  const handleEdit = (img) => {
    setEditingId(img._id);
    setEditData({
      title: img.title,
      tags: img.tags.join(", "),
      category: img.category || '',
    });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSave = async (id) => {
    await fetch(`http://localhost:5000/api/images/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editData.title,
        tags: editData.tags.split(",").map((t) => t.trim()),
        category: editData.category,
      }),
    });
    setEditingId(null);
    fetchImages();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchImages({ title: search, tag: searchTag });
  };

  // Modal form reset on open/close
  const openModal = () => {
    setTitle("");
    setTags("");
    setImageFile(null);
    setCustomFolder("");
    setUseCustomFolder(false);
    setFolder("");
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  return (
    <motion.div
      className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-purple-50 to-white py-0 px-0"
      initial={{ y: 40, scale: 0.97 }}
      animate={{ y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 16, mass: 0.8 }}
    >
      {/* Header */}
      <div className="w-full bg-gradient-to-r from-blue-500 to-purple-600 py-3 md:py-5 px-2 md:px-4 mb-6 md:mb-8 shadow-sm">
        <h1 className="text-xl md:text-3xl lg:text-4xl font-extrabold text-white text-center tracking-tight drop-shadow-lg uppercase letter-spacing-wide">
          Admin Panel
        </h1>
      </div>
      <div className="max-w-screen mx-auto px-2 md:px-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <button
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 md:px-8 py-2 md:py-3 rounded-lg font-semibold shadow-lg transition text-base md:text-lg"
            onClick={openModal}
          >
            Add New
          </button>
          {message && (
            <div
              className={`text-center font-semibold ${message.includes("success")
                ? "text-green-600"
                : "text-red-600"
                }`}
            >
              {message}
            </div>
          )}
        </div>
        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 px-2"
              initial={{ backgroundColor: "rgba(0,0,0,0)" }}
              animate={{ backgroundColor: "rgba(0,0,0,0.4)" }}
              exit={{ backgroundColor: "rgba(0,0,0,0)" }}
              transition={{ duration: 0.25 }}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-2xl p-6 md:p-10 w-full max-w-md md:max-w-lg relative border border-blue-100"
                initial={{ y: 40, scale: 0.95 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: 40, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 160, damping: 18, mass: 0.7 }}
              >
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
                  onClick={closeModal}
                  aria-label="Close"
                >
                  &times;
                </button>
                <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-800 text-center">Add New Image</h3>
                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5 w-full">
                  <input
                    type="text"
                    placeholder="Title"
                    className="w-full border border-gray-300 px-4 py-2 md:py-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 text-sm md:text-base"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Tags (comma separated)"
                    className="w-full border border-gray-300 px-4 py-2 md:py-3 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none text-gray-700 text-sm md:text-base"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                  <div>
                    <label className="block mb-1 font-medium text-gray-700">Folder</label>
                    <select
                      className="w-full border border-gray-300 px-4 py-2 md:py-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 mb-2 text-sm md:text-base"
                      value={useCustomFolder ? "__custom__" : folder}
                      onChange={handleFolderChange}
                    >
                      <option value="">Select a folder</option>
                      {folders?.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                      <option value="__custom__">Create new folder...</option>
                    </select>
                    {useCustomFolder && (
                      <input
                        type="text"
                        placeholder="Enter new folder name"
                        className="w-full border border-gray-300 px-4 py-2 md:py-3 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none text-gray-700 mt-2 text-sm md:text-base"
                        value={customFolder}
                        onChange={(e) => setCustomFolder(e.target.value)}
                        required
                      />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full border border-gray-300 px-4 py-2 md:py-3 rounded-lg bg-gray-50 text-gray-700 text-sm md:text-base"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    required
                  />
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 md:py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition text-base md:text-lg shadow"
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Add Image"}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Images Table */}
        <div className="bg-white rounded-2xl shadow-2xl w-full mx-auto p-2 md:p-8 border border-blue-100 overflow-x-auto">
          <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-800">All Images</h3>
          <input
            type="text"
            placeholder="Search by title or tag"
            className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 mb-4 md:mb-6 w-full text-sm md:text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {loading && (
            <div className="flex justify-center items-center my-4">
              <svg className="animate-spin h-6 w-6 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              <span className="text-blue-600 font-semibold">Loading...</span>
            </div>
          )}
          <div className="overflow-x-auto rounded-xl">
            <table className="min-w-full divide-y divide-gray-200 text-gray-800 text-sm md:text-base">
              <thead>
                <tr className="bg-blue-50">
                  <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold">Image</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold">Title</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold">Tags</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold">Category</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {images?.map((img, idx) => (
                  <tr key={img._id} className={idx % 2 === 0 ? "bg-white" : "bg-blue-50 hover:bg-blue-100 transition"}>
                    <td className="px-2 md:px-4 py-2">
                      <img src={img.url} alt={img.title} className="h-10 md:h-12 w-10 md:w-12 object-cover rounded shadow" />
                    </td>
                    <td className="px-2 md:px-4 py-2">
                      {editingId === img._id ? (
                        <input
                          name="title"
                          value={editData.title}
                          onChange={handleEditChange}
                          className="border px-2 py-1 rounded w-24 md:w-32"
                        />
                      ) : (
                        <span className="font-medium text-gray-700">{img.title}</span>
                      )}
                    </td>
                    <td className="px-2 md:px-4 py-2">
                      {editingId === img._id ? (
                        <input
                          name="tags"
                          value={editData.tags}
                          onChange={handleEditChange}
                          className="border px-2 py-1 rounded w-24 md:w-32"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {img.tags?.map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium border border-blue-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-2 md:px-4 py-2">
                      {editingId === img._id ? (
                        <input
                          name="category"
                          value={editData.category}
                          onChange={handleEditChange}
                          className="border px-2 py-1 rounded w-24 md:w-32"
                        />
                      ) : (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium border border-purple-200">
                          {img.category}
                        </span>
                      )}
                    </td>
                    <td className="px-2 md:px-4 py-2 md:space-x-2 text-right">
                      {editingId === img._id ? (
                        <>
                          <button
                            onClick={() => handleEditSave(img._id)}
                            className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded-full p-2 shadow transition"
                            title="Save"
                            aria-label="Save"
                          >
                            <FaSave />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="inline-flex items-center justify-center bg-gray-400 hover:bg-gray-500 text-white rounded-full p-2 shadow transition"
                            title="Cancel"
                            aria-label="Cancel"
                          >
                            <FaTimes />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(img)}
                            className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow transition"
                            title="Edit"
                            aria-label="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(img._id)}
                            className="inline-flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow transition"
                            title="Delete"
                            aria-label="Delete"
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

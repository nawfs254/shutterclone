import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// import { motion } from "framer-motion";

// Remove cardVariants and all motion.div usage

function FadeInImage({ src, alt, className }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      src={src}
      alt={alt}
      className={
        className +
        " transition-opacity duration-700 ease-in-out" +
        (loaded ? " opacity-100" : " opacity-0")
      }
      onLoad={() => setLoaded(true)}
      draggable={false}
    />
  );
}

export default function CategoryPage() {
  const { category } = useParams();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/images/category/${encodeURIComponent(category)}`)
      .then(res => res.json())
      .then(data => setImages(data))
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="min-h-screen w-full bg-[#f7f8fa] py-0 px-0">
      {/* Header */}
      <div className="w-full bg-gradient-to-r from-blue-500 to-purple-600 py-5 px-4 mb-8 shadow-sm">
        <h1 className="text-xl md:text-3xl font-bold text-white text-center tracking-tight drop-shadow-lg uppercase letter-spacing-wide">
          {category}
        </h1>
      </div>
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4">
        {loading ? (
          <div className="flex justify-center items-center my-20">
            <svg className="animate-spin h-8 w-8 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <span className="text-blue-600 font-semibold text-lg">Loading...</span>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center text-gray-500 text-lg mt-20">No images found in this category.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 justify-center">
            {images.map((img, i) => (
              <div
                key={img._id}
                className={
                  "relative bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-400 transition-all duration-200 overflow-hidden mx-auto flex flex-col items-center group transform-gpu hover:scale-105"
                }
                style={{ width: 200, animationDelay: `${i * 80}ms` }}
              >
                <div className="relative w-full h-40 overflow-hidden">
                  <FadeInImage
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Download icon overlay (only on hover) */}
                  <button
                    onClick={async () => {
                      const response = await fetch(img.url, { mode: 'cors' });
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = img.title ? `${img.title}.jpg` : 'image.jpg';
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      window.URL.revokeObjectURL(url);
                    }}
                    className="absolute top-2 right-2 bg-white/90 rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-blue-600 hover:text-white"
                    title="Download image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-blue-600 group-hover:text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v12m0 0l-4-4m4 4l4-4m-9 6.75h10.5" />
                    </svg>
                  </button>
                </div>
                <div className="p-3 w-full flex flex-col items-center">
                  <div className="font-semibold text-gray-800 text-sm truncate w-full text-center mb-1" title={img.title}>{img.title}</div>
                  <div className="flex flex-wrap justify-center gap-1 mt-1 w-full">
                    {img.tags?.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium border border-blue-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
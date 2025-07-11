import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";

const categories = [
	{
		name: "Nature",
		image:
			"https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
	},
	{
		name: "Business",
		image:
			"https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80",
	},
	{
		name: "Technology",
		image:
			"https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80",
	},
	{
		name: "People",
		image:
			"https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
	},
	{
		name: "Animals",
		image:
			"https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=400&q=80",
	},
	{
		name: "Travel",
		image:
			"https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80",
	},
];

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

export default function Home() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (search.trim() === "") {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    const delayDebounce = setTimeout(() => {
      fetch(`http://localhost:5000/api/images?search=${encodeURIComponent(search)}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data.images || data); // support both paginated and non-paginated
          setShowDropdown(true);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  // Hide dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gray-100">
      {/* Banner with search */}
      <div className="relative w-full bg-gradient-to-r from-blue-500 to-purple-600 py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Find the perfect image
        </h1>
        <p className="text-lg text-white mb-8">
          Stunning royalty-free images & photos
        </p>
        <div className="max-w-xl mx-auto relative" ref={dropdownRef}>
          <input
            type="text"
            placeholder="Search images, vectors, and more..."
            className="flex-1 px-4 py-3 outline-none text-gray-700 w-full rounded-lg shadow bg-gray-200"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
            autoComplete="off"
          />
          {loading && search.trim() !== "" && (
            <div className="absolute right-2 top-2.5 flex items-center">
              <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
            </div>
          )}
          {/* AnimatePresence and motion.div removed */}
          {showDropdown && results.length > 0 && (
            <div
              className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto text-left"
            >
              {results.map(img => (
                <div key={img._id} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  <img src={img.url} alt={img.title} className="h-10 w-10 object-cover rounded" />
                  <div>
                    <div className="font-medium text-gray-800">{img.title}</div>
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
                  </div>
                </div>
              ))}
              {results.length === 0 && !loading && (
                <div className="px-4 py-2 text-gray-500">No results found.</div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Categories */}
      <div className="max-w-6xl mx-auto py-12 px-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Browse by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((cat, i) => (
            <div
              key={cat.name}
              className={
                "bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer group overflow-hidden transform-gpu hover:scale-105 duration-200"
              }
              style={{ animationDelay: `${i * 80}ms` }}
              onClick={() => navigate(`/category/${encodeURIComponent(cat.name)}`)}
            >
              <FadeInImage
                src={cat.image}
                alt={cat.name}
                className="w-full h-32 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-200"
              />
              <div className="p-3 text-center">
                <span className="font-medium text-gray-700 group-hover:text-blue-600">
                  {cat.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

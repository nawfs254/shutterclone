import React from "react";
import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center py-16 px-4">
      <motion.div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-10 flex flex-col items-center"
        initial={{ y: 40, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 16, mass: 0.8 }}
      >
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
          alt="About ShutterClone"
          className="w-32 h-32 object-cover rounded-full border-4 border-blue-500 shadow mb-6"
        />
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4 text-center">
          About ShutterClone
        </h1>
        <p className="text-gray-600 text-lg mb-6 text-center">
          ShutterClone is a modern image search and browsing platform inspired by
          Shutterstock.
          <br />
          Built with{" "}
          <span className="font-semibold text-blue-600">React</span>,{" "}
          <span className="font-semibold text-purple-600">Vite</span>,{" "}
          <span className="font-semibold text-blue-500">Tailwind CSS</span>, and{" "}
          <span className="font-semibold text-pink-600">React Router</span>.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            Fast & Modern UI
          </span>
          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
            Responsive Design
          </span>
          <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-medium">
            Easy Navigation
          </span>
        </div>
      </motion.div>
    </div>
  );
}

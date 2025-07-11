import React from "react";

export default function Header() {
  return (
    <header className="w-full bg-white shadow py-4 px-8 flex items-center justify-between z-10">
      <span className="text-2xl font-bold text-blue-600"><a href="/">ShutterClone</a></span>
      <nav className="space-x-6">
        <a href="/" className="text-gray-700 hover:text-blue-600 font-medium">Home</a>
        <a href="/about" className="text-gray-700 hover:text-blue-600 font-medium">About</a>
      </nav>
    </header>
  );
}

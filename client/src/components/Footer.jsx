import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-white py-3 text-center">
      <span>&copy; {new Date().getFullYear()} ShutterClone. All rights reserved.</span>
    </footer>
  );
}

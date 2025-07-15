import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Footer: React.FC = () => {
  const { user } = useAuth();
  return (
    <footer className="w-full py-8 bg-black/80 border-t border-cyan-900 text-gray-400 text-sm mt-8 relative z-50">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        {/* Contact and Quick Links */}
        <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
          <div>
            <span className="block font-semibold text-white mb-1">Need help?</span>
            <span>Contact us at <a href="mailto:support@devs-society.com" className="text-cyan-400 hover:underline">support@devs-society.com</a></span>
          </div>
          <div className="md:ml-12">
            <span className="block font-semibold text-white mb-1">Quick Links</span>
            <nav className="flex gap-4 flex-wrap">
              {!user && (
                <>
                  <Link to="/login" className="hover:text-cyan-400 transition-colors">Login</Link>
                  <Link to="/register" className="hover:text-cyan-400 transition-colors">Register</Link>
                </>
              )}
              {user && (
                <>
                  <Link to="/events" className="hover:text-cyan-400 transition-colors">Event</Link>
                  <Link to="/card" className="hover:text-cyan-400 transition-colors">Card</Link>
                </>
              )}
              <Link to="/developers" className="hover:text-cyan-400 transition-colors">Developer</Link>
            </nav>
          </div>
        </div>
        {/* Copyright */}
        <div className="text-center md:text-right text-gray-500 mt-4 md:mt-0">
          &copy; {new Date().getFullYear()} DEVS Society. All rights reserved.
        </div>
      </div>
      {/* Made with Love */}
      <div className="mt-6 text-center text-gray-400 flex items-center justify-center gap-2">
        <span>Made with</span>
        <svg className="inline w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" /></svg>
        <span>by devs-society</span>
      </div>
    </footer>
  );
};

export default Footer; 
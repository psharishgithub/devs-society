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
            <span>Contact us at <a href="mailto:contact@devs-society.com" className="text-cyan-400 hover:underline">contact@devs-society.com</a></span>
          </div>
          <div className="md:ml-12">
            <nav className="flex gap-4 flex-wrap">
              <Link to="/terms" className="hover:text-cyan-400 transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link>
              <Link to="/cancellation" className="hover:text-cyan-400 transition-colors">Cancellation Policy</Link>
              <Link to="/refund" className="hover:text-cyan-400 transition-colors">Refund Policy</Link>
            </nav>
          </div>
        </div>
        {/* Made with Precision - Center */}
        <div className="text-center text-gray-400 flex items-center justify-start gap-2 flex-1">
          <span>Crafted</span>
          <svg className="inline w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
          <span>with passion by</span>
          <Link to="/developers" className="text-cyan-400 hover:text-cyan-300 hover:underline transition-all duration-300 font-semibold hover:scale-105 hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] animate-pulse drop-shadow-[0_0_6px_rgba(34,211,238,0.4)] text-lg">Developer</Link>
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
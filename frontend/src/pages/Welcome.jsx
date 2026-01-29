import React from 'react';
import { Link } from 'react-router-dom';

function Welcome() {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            {/* Navbar */}
            <nav className="flex flex-col md:flex-row justify-between items-center p-6 border-b border-gray-800 space-y-4 md:space-y-0">
                <div className="flex items-center space-x-3">
                    <img src="/logo.png" alt="AuthNexus Logo" className="h-10 w-10 object-contain" />
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                        AuthNexus
                    </h1>
                </div>
                <div className="flex space-x-4">
                    <Link to="/login" className="px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition">
                        Login
                    </Link>
                    <Link to="/register" className="px-5 py-2 text-sm font-bold bg-blue-600 rounded-full hover:bg-blue-700 transition shadow-lg">
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-12">
                <div className="max-w-3xl space-y-6">
                    <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight">
                        Secure Identity for the <span className="text-blue-500">Modern Web</span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Enterprise-grade authentication with Multi-Factor Authentication, OAuth2, and robust security policies.
                    </p>
                    <div className="pt-4 flex justify-center gap-4">
                        <Link to="/register" className="px-8 py-3 bg-white text-gray-900 font-bold rounded-lg hover:bg-gray-100 transition transform hover:scale-105">
                            Create Account
                        </Link>
                        <a href="http://127.0.0.1:5000/apidocs/index.html" target="_blank" className="px-8 py-3 border border-gray-600 rounded-lg hover:border-gray-400 transition">
                            API Docs
                        </a>
                    </div>
                </div>

                {/* Feature Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                    <FeatureCard
                        title="Multi-Factor Auth"
                        desc="TOTP, Email OTP, and Recovery Codes."
                        img="https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=400&q=80"
                    />
                    <FeatureCard
                        title="OAuth 2.0 Provider"
                        desc="Secure Authorization Code Flow."
                        img="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=80"
                    />
                    <FeatureCard
                        title="Defense in Depth"
                        desc="Rate limiting, Auditing, and Encryption."
                        img="https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=400&q=80"
                    />
                </div>
            </main>
        </div>
    );
}

function FeatureCard({ title, desc, img }) {
    return (
        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition border border-gray-700 group">
            <div className="h-48 overflow-hidden">
                <img src={img} alt={title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition duration-500 transform group-hover:scale-110" />
            </div>
            <div className="p-6 text-left">
                <h3 className="text-xl font-bold mb-2 text-blue-400">{title}</h3>
                <p className="text-gray-400">{desc}</p>
            </div>
        </div>
    );
}

export default Welcome;

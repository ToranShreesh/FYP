import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { baseUrl } from "../../constants";

const Navbar = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [userName, setUserName] = useState("User");
    const isAdmin = localStorage.getItem("role") === "admin";
    const isLoggedIn = !!localStorage.getItem("token");

    useEffect(() => {
        if (isLoggedIn) {
            const formData = new FormData();
            formData.append("token", localStorage.getItem("token"));

            fetch(`${baseUrl}getUserProfile.php`, {
                method: "POST",
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.user.full_name) {
                    setUserName(data.user.full_name);
                    localStorage.setItem("username", data.user.full_name);
                }
            })
            .catch(error => console.error("Error fetching user profile:", error));
        }
    }, [isLoggedIn]);

    const handleLogout = () => {
        localStorage.removeItem("role");
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        window.location.href = "/";
    };

    return (
        <div className="fixed top-0 w-full h-16 bg-white flex justify-between items-center px-6 shadow-sm z-50">
            {/* Logo Section */}
            <div className="flex items-center gap-2">
                <NavLink to="/home" className="no-underline">
                    <span className="font-bold text-xl text-gray-800 font-sans tracking-wide">
                         Hotel Ease
                    </span>
                </NavLink>
            </div>

            {/* Navigation Links */}
            <div className="flex gap-6 items-center">
                <NavLink to="/home" className="text-base text-gray-600 hover:text-gray-800 transition-colors">
                    Home
                </NavLink>
                <NavLink to="/rooms" className="text-base text-gray-600 hover:text-gray-800 transition-colors">
                    Rooms
                </NavLink>
                <NavLink to="/facilities" className="text-base text-gray-600 hover:text-gray-800 transition-colors">
                    Facilities
                </NavLink>
                <NavLink to="/about-us" className="text-base text-gray-600 hover:text-gray-800 transition-colors">
                    About-Us
                </NavLink>
            </div>

            {/* Profile and Authentication */}
            <div className="flex gap-3 items-center">
                {isLoggedIn ? (
                    <div className="relative">
                        <button 
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all duration-200"
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-gray-700 text-base">{userName}</span>
                                <svg 
                                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </button>
                        
                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 border border-gray-100 transform transition-all duration-200">
                                <NavLink 
                                    to="/profile" 
                                    className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                                    onClick={() => setShowDropdown(false)}
                                >
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    My Profile
                                </NavLink>
                                <NavLink 
                                    to="/update-profile" 
                                    className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                                    onClick={() => setShowDropdown(false)}
                                >
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    Update Profile
                                </NavLink>
                                <NavLink 
                                    to="/my-bookings" 
                                    className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                                    onClick={() => setShowDropdown(false)}
                                >
                                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    My Bookings
                                </NavLink>
                                <hr className="my-2 border-gray-100" />
                                <button 
                                    className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors"
                                    onClick={handleLogout}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <>
                        <NavLink 
                            to="/login" 
                            className="px-4 py-1.5 border border-gray-300 text-gray-600 rounded-md font-medium hover:bg-gray-100 transition-colors duration-200"
                        >
                            Login
                        </NavLink>
                        <NavLink 
                            to="/register" 
                            className="px-4 py-1.5 border border-gray-300 text-gray-600 rounded-md font-medium hover:bg-gray-100 transition-colors duration-200"
                        >
                            Register
                        </NavLink>
                    </>
                )}
            </div>
        </div>
    );
};

export default Navbar;
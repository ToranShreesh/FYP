import { NavLink } from "react-router-dom"; 
import "./style.css";

const Navbar = () => {
    const isAdmin = localStorage.getItem("role") === "admin";
    return (
        <div className="fixed top-0 w-full h-20 bg-white flex justify-between items-center px-8 shadow-md z-50">
            {/* Logo Section */}
            <div className="flex items-center gap-2">
                <NavLink to="/" className="no-underline">
                    <span className="font-bold text-2xl text-gray-800 font-sans">
                        HOTEL POKHARA
                    </span>
                </NavLink>
            </div>

            {/* Navigation Links */}
            <div className="flex gap-5 items-center">
                {!isAdmin && (
                    <>
                        <NavLink
                            to="/rooms"
                            className={({ isActive }) =>
                                `text-lg ${isActive ? 'text-blue-500 font-semibold' : 'text-gray-800'} hover:text-blue-500`
                            }
                        >
                            Rooms
                        </NavLink>
                        <NavLink
                            to="/facilities"
                            className={({ isActive }) =>
                                `text-lg ${isActive ? 'text-blue-500 font-semibold' : 'text-gray-800'} hover:text-blue-500`
                            }
                        >
                            Facilities
                        </NavLink>
                        <NavLink
                            to="/contact-us"
                            className={({ isActive }) =>
                                `text-lg ${isActive ? 'text-blue-500 font-semibold' : 'text-gray-800'} hover:text-blue-500`
                            }
                        >
                            Contact Us
                        </NavLink>
                        <NavLink
                            to="/about-us"
                            className={({ isActive }) =>
                                `text-lg ${isActive ? 'text-blue-500 font-semibold' : 'text-gray-800'} hover:text-blue-500`
                            }
                        >
                            About Us
                        </NavLink>
                    </>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 items-center pr-10">
                {!isAdmin ? (
                    <>
                        <NavLink
                            to="/login"
                            className={({ isActive }) =>
                                `px-4 py-2 border rounded-lg text-lg ${isActive ? 'bg-blue-500 text-white' : 'border-gray-800 text-gray-800'} hover:bg-blue-500 hover:text-white`
                            }
                        >
                            Login
                        </NavLink>
                        <NavLink
                            to="/register"
                            className={({ isActive }) =>
                                `px-4 py-2 border rounded-lg text-lg ${isActive ? 'bg-blue-500 text-white' : 'border-gray-800 text-gray-800'} hover:bg-blue-500 hover:text-white`
                            }
                        >
                            Register
                        </NavLink>
                    </>
                ) : (
                    <button className="px-5 py-2 bg-gray-800 text-white rounded-lg cursor-pointer hover:bg-gray-700">
                        Logout
                    </button>
                )}
            </div>
        </div>
    );
};

export default Navbar;

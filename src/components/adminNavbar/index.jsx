import { Link } from "react-router-dom";
import LogoutButton from "../LogoutButton";
import { IoIosMenu } from "react-icons/io";

const AdminNavbar = ({ showMenu, onMenuClick }) => {
    const isAdmin = localStorage.getItem("role") === "admin";

    if (!isAdmin) {
        return null;
    }

    return (
        <nav className="bg-gray-800 text-white p-4 shadow-md fixed w-full top-0 z-50 flex items-center justify-between px-6 py-3">
            {/* Left Section */}
            <div className="flex items-center gap-4">
                {showMenu && (
                    <IoIosMenu
                        className="text-white cursor-pointer hover:text-gray-200 transition-transform transform hover:scale-110"
                        size={32}
                        onClick={onMenuClick}
                    />
                )}
                <Link to="/admin" className="text-white font-semibold text-lg tracking-wide hover:text-gray-200 transition">
                    Hotel Pokhara
                </Link>
            </div>

            
        </nav>
    );
};

export default AdminNavbar;

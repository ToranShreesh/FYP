import { FaHome, FaBed, FaTable, FaBoxes, FaPlusSquare, FaListAlt, FaKey, FaHotel, FaStar, FaComments, FaClipboardList, FaFileInvoiceDollar, FaSignOutAlt } from "react-icons/fa";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../../constants";

const Sidebar = ({ active, setActive }) => {
  const navigate = useNavigate();

  const menuOptions = [
    { title: "Dashboard", icon: <FaHome />, link: "/admin" },
    { title: "Add Room Class", icon: <FaTable />, link: "/admin" },
    { title: "Add Rooms", icon: <FaBed />, link: "/admin" },
    { title: "Add Facility", icon: <FaPlusSquare />, link: "/admin" },
    { title: "Facility", icon: <FaListAlt />, link: "/admin" },
    { title: "Room Class", icon: <FaKey />, link: "/admin" },
    { title: "Rooms", icon: <FaHotel />, link: "/admin" },
    { title: "Facility Ratings", icon: <FaStar />, link: "/admin" },
    { title: "Reviews", icon: <FaComments />, link: "/admin" },
    { title: "Bookings", icon: <FaClipboardList />, link: "/admin" },
    { title: "Reports", icon: <FaFileInvoiceDollar />, link: "/admin" },
    { title: "Payments", icon: <FaFileInvoiceDollar />, link: "/admin" },
    { title: "Logout", icon: <FaSignOutAlt />, isLogout: true },
  ];

  const onLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No token found");
        navigate("/login");
        return;
      }

      const response = await fetch(`${baseUrl}auth/logout.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error(`Logout failed: ${response.statusText}`);
      }

      await response.json();
      localStorage.removeItem("token");
      navigate("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="bg-indigo-900 text-gray-100 w-64 p-4 min-h-screen shadow-lg flex flex-col py-4">
      {menuOptions.map((option, index) => {
        const isActive = active === index;
        return (
          <button
            key={index}
            onClick={() => {
              setActive(index);
              if (option.isLogout) {
                onLogout();
              } else {
                navigate(option.link);
              }
            }}
            className={`flex items-center gap-4 w-full text-white text-lg px-6 py-3 rounded-md transition-all ${
              isActive ? "bg-sky-500 text-[#6EACDA] font-semibold shadow-md" : "hover:bg-[#5B9ACB]"
            }`}
          >
            {option.icon}
            <span>{option.title}</span>
          </button>
        );
      })}
    </div>
  );
};

export default Sidebar;

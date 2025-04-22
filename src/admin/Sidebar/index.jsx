import { IoMdHome } from "react-icons/io";
import { FaTable } from "react-icons/fa6";
import { FaBoxes } from "react-icons/fa";
import { MdPayments } from "react-icons/md";
import { FiLogOut } from "react-icons/fi"; // Added for logout
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../../constants";

const Sidebar = ({ active, setActive }) => {
  const navigate = useNavigate();

  const menuOptions = [
    { title: "Dashboard", icon: <IoMdHome />, link: "/admin" },
    { title: "Add Rooms", icon: <FaTable />, link: "/admin" },
    { title: "AddRoomClass", icon: <FaBoxes />, link: "/admin" },
    { title: "Add Facility", icon: <FaBoxes />, link: "/admin" },
    { title: "Facility", icon: <FaBoxes />, link: "/admin" },
    { title: "RoomClass", icon: <FaBoxes />, link: "/admin" },
    { title: "Rooms", icon: <FaBoxes />, link: "/admin" },
    { title: "Facility Ratings", icon: <FaBoxes />, link: "/admin" },
    { title: "Reviews", icon: <FaBoxes />, link: "/admin" },
    { title: "Bookings", icon: <FaBoxes />, link: "/admin" },
    { title: "Reports", icon: <MdPayments />, link: "/admin" },
    { title: "Payments", icon: <MdPayments />, link: "/admin" },
    { title: "Logout", icon: <FiLogOut />, isLogout: true }, // Added logout
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
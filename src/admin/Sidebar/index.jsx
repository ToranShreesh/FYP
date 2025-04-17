import { IoMdHome } from "react-icons/io";
import { FaTable } from "react-icons/fa6";
import { FaBoxes } from "react-icons/fa";
import { MdPayments } from "react-icons/md";

const Sidebar = ({ active, setActive }) => {
    const menuOptions = [
        { title: "Dashboard", icon: <IoMdHome />, link: "/admin" },
        { title: "Add Rooms", icon: <FaTable />, link: "/admin/addroom" },
        { title: "AddRoomClass", icon: <FaBoxes />, link: "/admin/addRoomClass" },
        { title: "Add Facility", icon: <FaBoxes />, link: "/admin/addFacility" },
        { title: "Facility", icon: <FaBoxes />, link: "/admin/facility" },
        { title: "RoomClass", icon: <FaBoxes />, link: "/admin/editRoomClass" },
        { title: "Rooms", icon: <FaBoxes />, link: "/admin/editRoom" },
        { title: "Facility Ratings", icon: <FaBoxes />, link: "/admin/facilityRatings" },
        { title: "Reports", icon: <MdPayments />, link: "/admin/adminReport" },
        { title: "Payments", icon: <MdPayments />, link: "/admin/paymentList" },
    ];

    return (
        <div className="bg-indigo-900 text-gray-100 w-64 p-4 min-h-screen shadow-lg flex flex-col py-4">
            {menuOptions.map((option, index) => {
                const isActive = active === index;
                return (
                    <button 
                        key={index} 
                        onClick={() => setActive(index)} 
                        className={`flex items-center gap-4 w-full text-white text-lg px-6 py-3 rounded-md transition-all 
                        ${isActive ? "bg-sky-500 text-[#6EACDA] font-semibold shadow-md" : "hover:bg-[#5B9ACB]"}`}>
                        {option.icon}
                        <span>{option.title}</span>
                    </button>
                );
            })}
        </div>
    );
}

export default Sidebar;

import { useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../Sidebar";
import AdminHome from "../home";
import { IoIosMenu } from "react-icons/io";
import AdminNavbar from "../../components/adminNavbar";
import AddRoomClass from "../addRoomClass";
import AddRoom from "../addRoom";
import AddFacility from "../addFacility";
import EditRoom from "../editRoom";
import AdminReports from "../adminReport";
import EditRoomClass from "../editRoomClass";
import PaymentList from "../paymentList";
import ManageFacilities from "../facility";
import FacilityRatings from "../facilityRating";
import Reviews from "../reviews";
import Bookings from "../bookings";



const AdminDashboard = () => {
    const [isExpanded, setIsExpanded] = useState(false)
    const pages = [
        <AdminHome />,
        <AddRoomClass/>,
        <AddRoom/>,
        <AddFacility/>,
        <ManageFacilities/>,
        <EditRoomClass/>,
        <EditRoom/>,
        <FacilityRatings/>,
        <Reviews/>,
        <Bookings/>,
        <AdminReports />,
        <PaymentList/>
    ];


    const [active, setActive] = useState(0)
    return (<>
        <div >
            <div style={{
                position: "fixed",
                width: "100%",
                zIndex: 100,
            }}>
                <AdminNavbar showMenu={true} onMenuClick={() => setIsExpanded(!isExpanded)} />
            </div>
            <div style={{
                display: "flex",
                paddingTop: "50px",
                overflow: "hidden"
            }}>
                <Sidebar active={active} setActive={setActive} isExpanded={isExpanded} />
                {
                    <div style={{
                        padding: "20px",
                        overflowY: "hidden"
                    }}>

                        {pages[active]}
                    </div>
                }
            </div>
        </div>

    </>);
}

export default AdminDashboard;  
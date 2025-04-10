import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AboutUs from "./about-us";
import Home from "./home";
import Login from "./login";
import RegisterPage from "./register";
import { Toaster } from "react-hot-toast";
import "./global.css";
import Rooms from "./Rooms";
import ContactUs from "./contact-us";
import Facilities from "./facilities";
import RoomDetailPage from "./room-detail";
import BookingPage from "./room-book";
import ProfilePage from "./profile";
import BookingCancel from "./booking-cancel"; 
import BookingUpdate from "./booking-update";
import PaymentSuccess from "./payment-success";


function App() {
  const token = localStorage.getItem("token");

  const router = createBrowserRouter([
    {
      path: "/",
      element: token ? <Login /> : <Login />, 
    },
    {
      path: "/home",
      element: <Home />,
    },
    {
      path: "/about-us",
      element: <AboutUs />,
    },
    {
      path: "/facilities",
      element: <Facilities />,
    },
    {
      path: "/contact-us",
      element: <ContactUs />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <RegisterPage />,
    },
    {
      path: "/rooms",
      element: <Rooms />,
    },
    {
      path: "/profile",
      element: <ProfilePage />,
    },
    {
      path: "/room/:room_class_id",
      element: <RoomDetailPage />,
    },
    {
      path: "/book/:room_class_id",
      element: <BookingPage />,
      
    },
    {
      path: "/payment-success",
      element: <PaymentSuccess />,
      
    },


    {
      path: "/booking-update/:booking_id", 
      element: <BookingUpdate />,
    },
    {
      path: "/booking-cancel/:booking_id", 
      element: <BookingCancel />,
    },
    {
      path: "*",
      element: <div>Page Not Found</div>,
    },
  ]);

  return (
    <>
    
      <Toaster />
      <RouterProvider router={router} />
    </>
  );
}

export default App;

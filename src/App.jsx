import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import AboutUs from "./about-us";
import Home from "./home";
import Login from "./login";
import RegisterPage from "./register";
import { Toaster } from "react-hot-toast";
import "./global.css";
import Rooms from "./Rooms";
import Facilities from "./facilities";
import RoomDetailPage from "./room-detail";
import BookingPage from "./room-book";
import ProfilePage from "./profile";
import BookingCancel from "./booking-cancel";
import BookingUpdate from "./booking-update";
import PaymentSuccess from "./payment-success";
import UpdateProfile from "./updateProfile";
import MyBookings from "./myBookings";

// Track if toast has been shown to prevent multiple toasts
let hasShownToast = false;

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    // Show toast only if it hasn't been shown yet
    if (!hasShownToast) {
      toast.error("Please login to access this page", {
        duration: 3000,
        position: "top-center",
      });
      hasShownToast = true; // Mark toast as shown
    }
    // Redirect to login page
    return <Navigate to="/login" replace />;
  }

  // Reset toast flag when user is authenticated (optional, depending on your needs)
  hasShownToast = false;
  return children;
}

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
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
      path: "/my-bookings",
      element: <MyBookings />,
    },
    {
      path: "/update-profile",
      element: <UpdateProfile />,
    },
    {
      path: "/room/:room_class_id",
      element: <RoomDetailPage />, // Removed ProtectedRoute
    },
    {
      path: "/book/:room_class_id",
      element: (
        <ProtectedRoute>
          <BookingPage />
        </ProtectedRoute>
      ),
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
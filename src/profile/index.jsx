import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { baseUrl } from "../constants";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Unauthorized access. Please log in.");
      setLoading(false);
      return;
    }

    fetch(`${baseUrl}getUserProfile.php`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
          setBookings(data.bookings);
        } else {
          setError(data.message);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch data. Try again later.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg animate-pulse">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 text-lg font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-grow container mx-auto p-6 max-w-6xl mt-20"> {/* Increased max-width */}
        <h1 className="text-4xl font-extrabold text-gray-800 text-center">My Profile</h1>

        {/* User Info */}
        <div className="mt-6 p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-800">User Details</h3>
          <p className="text-gray-700 mt-2"><strong>Name:</strong> {user.full_name}</p>
          <p className="text-gray-700"><strong>Email:</strong> {user.email}</p>
        </div>

        {/* Booking History */}
        <div className="mt-6 p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-800">Booking List</h3>
          {bookings.length > 0 ? (
            <div className="mt-4 overflow-x-auto"> {/* Horizontal scrolling container */}
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-3">Room Number</th> {/* Updated header */}
                    <th className="border p-3">Room Class</th>
                    <th className="border p-3">Booking Date</th>
                    <th className="border p-3">Check-in</th>
                    <th className="border p-3">Check-out</th>
                    <th className="border p-3">Amount</th>
                    <th className="border p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking, index) => (
                    <tr key={index} className="text-center">
                      <td className="border p-3">{booking.room_number}</td> {/* Display room number */}
                      <td className="border p-3">{booking.class_name}</td>
                      <td className="border p-3">{booking.booking_date}</td>
                      <td className="border p-3">{booking.checkin_date}</td>
                      <td className="border p-3">{booking.checkout_date}</td>
                      <td className="border p-3 font-semibold text-green-600">Rs {booking.booking_amount}</td>
                      <td className="border p-3">
                        <button
                          onClick={() => navigate(`/booking-update/${booking.booking_id}`)}
                          className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition duration-200 mr-2"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => navigate(`/booking-cancel/${booking.booking_id}`)}
                          className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition duration-200"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 mt-2">No bookings found.</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;

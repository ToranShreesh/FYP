import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { baseUrl } from "../constants";
import toast from "react-hot-toast";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Unauthorized access. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${baseUrl}getUserBookings.php`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ token }),
      });

      const data = await response.json();
      if (data.success) {
        setBookings(data.bookings);

        // Split bookings into active and past
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const active = data.bookings.filter(
          (booking) => !isCheckoutDatePassed(booking.checkout_date)
        );
        const past = data.bookings.filter((booking) =>
          isCheckoutDatePassed(booking.checkout_date)
        );
        setActiveBookings(active);
        setPastBookings(past);
      } else {
        setError(data.message);
      }
    } catch {
      setError("Failed to fetch bookings. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const isCheckoutDatePassed = (checkoutDate) => {
    const checkout = new Date(checkoutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    checkout.setHours(0, 0, 0, 0);
    return checkout < today;
  };

  const handleCancelBooking = async (bookingId) => {
    toast(
      (t) => (
        <div className="flex flex-col items-center space-y-4">
          <p className="text-gray-800">Are you sure you want to cancel this booking?</p>
          <div className="flex space-x-4">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                const token = localStorage.getItem("token");
                if (!token) {
                  setError("Unauthorized access. Please log in.");
                  return;
                }

                try {
                  const response = await fetch(`${baseUrl}cancelBooking.php`, {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({ token, booking_id: bookingId }),
                  });

                  const data = await response.json();
                  if (data.success) {
                    toast.success(data.message);
                    await fetchBookings();
                  } else {
                    setError(data.message);
                  }
                } catch {
                  setError("Failed to cancel booking. Try again later.");
                }
              }}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
            >
              Confirm
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        style: {
          background: "#fff",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          padding: "16px",
        },
      }
    );
  };

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

  const renderBookingTable = (bookings, title) => (
    <div className="mt-6 p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-2xl font-semibold text-gray-800">{title}</h3>
      {bookings.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3">Room Class</th>
                <th className="border p-3">Number of Rooms</th>
                <th className="border p-3">Check-in</th>
                <th className="border p-3">Check-out</th>
                <th className="border p-3">Amount</th>
                <th className="border p-3">Status</th>
                <th className="border p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.booking_id} className="text-center">
                  <td className="border p-3">{booking.room_class}</td>
                  <td className="border p-3">{booking.num_rooms}</td>
                  <td className="border p-3">{booking.checkin_date}</td>
                  <td className="border p-3">{booking.checkout_date}</td>
                  <td className="border p-3 font-semibold text-green-600">
                    Rs {booking.booking_amount}
                  </td>
                  <td className="border p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        booking.booking_status === "Completed"
                          ? "bg-green-100 text-green-600"
                          : booking.booking_status === "Cancelled"
                          ? "bg-red-100 text-red-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {booking.booking_status || "Pending"}
                    </span>
                  </td>
                  <td className="border p-3">
                    {booking.booking_status === "Cancelled" ? (
                      <span className="text-gray-500">Cancelled</span>
                    ) : isCheckoutDatePassed(booking.checkout_date) ? (
                      <button
                        disabled
                        className="bg-gray-400 text-white px-3 py-1 rounded-lg cursor-not-allowed"
                        title="Cannot cancel after checkout date"
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCancelBooking(booking.booking_id)}
                        className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition duration-200"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500 mt-2">No {title.toLowerCase()} found.</p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-grow container mx-auto p-6 max-w-6xl mt-20">
        <h1 className="text-4xl font-extrabold text-gray-800 text-center">My Bookings</h1>

        {/* Active Bookings */}
        {renderBookingTable(activeBookings, "Active Bookings")}

        {/* Past Bookings */}
        {renderBookingTable(pastBookings, "Past Bookings")}
      </div>
      <Footer />
    </div>
  );
};

export default MyBookings;
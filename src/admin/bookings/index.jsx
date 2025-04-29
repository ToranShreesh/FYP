import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { baseUrl } from "../../constants";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState({});

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${baseUrl}getBookings.php?token=${token}`);
        const data = await response.json();
        if (data.success) {
          setBookings(data.bookings);
        } else {
          setError(data.message || "Failed to load bookings");
          toast.error(data.message || "Failed to load bookings");
        }
      } catch (err) {
        setError("Error connecting to server");
        toast.error("Error connecting to server");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleDelete = (booking_id) => {
    // Show toast with confirmation buttons
    toast(
      (t) => (
        <div className="flex flex-col items-center gap-2">
          <p>Are you sure you want to delete this booking?</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id); // Dismiss the toast
                const token = localStorage.getItem("token");
                if (!token) {
                  toast.error("Please log in to continue");
                  return;
                }

                if (!booking_id || isNaN(booking_id) || booking_id <= 0) {
                  toast.error("Invalid booking ID");
                  return;
                }

                setDeleting((prev) => ({ ...prev, [booking_id]: true }));
                try {
                  const formData = new FormData();
                  formData.append("token", token);
                  formData.append("action", "delete");
                  formData.append("booking_id", booking_id);

                  const response = await fetch(`${baseUrl}getBookings.php`, {
                    method: "POST",
                    body: formData,
                  });

                  const data = await response.json();

                  if (data.success) {
                    setBookings(bookings.filter((booking) => booking.booking_id !== booking_id));
                    toast.success("Booking deleted successfully");
                  } else {
                    toast.error(data.message || "Failed to delete booking");
                  }
                } catch (err) {
                  toast.error("Error connecting to server");
                } finally {
                  setDeleting((prev) => ({ ...prev, [booking_id]: false }));
                }
              }}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Yes, Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity, // Keep toast open until user interacts
        style: {
          background: "#fff",
          color: "#000",
          border: "1px solid #e5e7eb",
        },
      }
    );
  };

  if (loading) {
    return <div className="text-center text-lg text-gray-600">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-lg text-red-600">
        {error}
        <button
          onClick={() => {
            setError("");
            setLoading(true);
            setBookings([]);
          }}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-[1150px] mx-auto p-4 sm:p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Bookings</h1>
      {bookings.length === 0 ? (
        <p className="text-center text-gray-600">No bookings found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Booking ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">User</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Booking Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Check-in</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Check-out</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Rooms</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Room Numbers</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Room Class</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Base Price</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.booking_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">{booking.booking_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">{booking.full_name || booking.user_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">{booking.booking_date}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">{booking.checkin_date}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">{booking.checkout_date}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">Rs{booking.booking_amount}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">{booking.booking_status}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">{booking.num_rooms}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">
                    {booking.room_numbers?.length > 0 ? booking.room_numbers.join(", ") : "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">{booking.room_class || "N/A"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">Rs{booking.base_price || "N/A"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">
                    <button
                      onClick={() => handleDelete(booking.booking_id)}
                      disabled={deleting[booking.booking_id]}
                      className={`px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors ${
                        deleting[booking.booking_id] ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {deleting[booking.booking_id] ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Bookings;
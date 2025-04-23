import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { Carousel } from "react-responsive-carousel";
import "react-datepicker/dist/react-datepicker.css";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { addDays, format, parseISO, isValid } from "date-fns";
import { baseUrl } from "../constants";
import toast from "react-hot-toast";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const BookRoom = () => {
  const { room_class_id } = useParams();
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [roomDetails, setRoomDetails] = useState(null);
  const [numRooms, setNumRooms] = useState(1);
  const [checkinDate, setCheckinDate] = useState(null);
  const [checkoutDate, setCheckoutDate] = useState(null);
  const [bookingAmount, setBookingAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [totalRooms, setTotalRooms] = useState(0);
  const [availableRoomsByDate, setAvailableRoomsByDate] = useState({});
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);
  const refreshIntervalRef = useRef(null);

  // Set token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) setToken(storedToken);
    else toast.error("Please log in first!");
  }, []);

  // Fetch room details
  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await fetch(`${baseUrl}getRoomDetail.php?room_class_id=${room_class_id}`);
        const data = await response.json();
        if (data.success) setRoomDetails(data.room_class);
        else toast.error(`Failed to fetch room details: ${data.message || "Unknown error"}`);
      } catch (error) {
        toast.error(`Error fetching room details: ${error.message}`);
      }
    };
    fetchRoomDetails();
  }, [room_class_id]);

  // Fetch availability
  const fetchAvailability = async (manual = false) => {
    if (!room_class_id) {
      toast.error("Room class ID is missing");
      setCalendarLoading(false);
      return;
    }

    setCalendarLoading(true);
    try {
      const response = await fetch(`${baseUrl}checkRoomAvailability.php?room_class_id=${room_class_id}&t=${Date.now()}`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) throw new Error(`HTTP error ${response.status}: ${response.statusText}`);

      const data = await response.json();
      if (data.success) {
        const validDates = data.unavailableDates.map((date) => parseISO(date)).filter((date) => isValid(date));
        setUnavailableDates(validDates);
        setTotalRooms(data.totalRooms);
        setAvailableRoomsByDate(data.availableRoomsByDate || {});
        setLastRefresh(new Date());
        if (manual) {
          toast(
            data.totalRooms === 0
              ? "No rooms available due to maintenance!"
              : `Updated: ${validDates.length} unavailable dates, ${data.totalRooms} rooms available`,
            { type: "success" }
          );
        }
      } else {
        throw new Error(`API error: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      toast.error(`Error fetching availability: ${error.message}`);
    } finally {
      setCalendarLoading(false);
    }
  };

  // Initial and periodic availability fetch
  useEffect(() => {
    fetchAvailability();
    refreshIntervalRef.current = setInterval(() => fetchAvailability(), 5 * 60 * 1000);
    return () => clearInterval(refreshIntervalRef.current);
  }, [room_class_id]);

  // Update booking amount
  useEffect(() => {
    if (roomDetails && checkinDate && checkoutDate) {
      const days = (checkoutDate - checkinDate) / (1000 * 60 * 60 * 24);
      setBookingAmount(days > 0 ? days * numRooms * roomDetails.base_price : 0);
    } else {
      setBookingAmount(0);
    }
  }, [checkinDate, checkoutDate, numRooms, roomDetails]);

  // Get available rooms for selected date range
  const getAvailableRoomsForRange = () => {
    if (!checkinDate || !checkoutDate) return totalRooms;
    let minAvailable = totalRooms;
    let currentDate = new Date(checkinDate);
    while (currentDate < checkoutDate) {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      const available = availableRoomsByDate[dateStr];
      if (available !== undefined) minAvailable = Math.min(minAvailable, available);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return minAvailable;
  };

  // Validate selected dates
  const isDateRangeValid = () => {
    if (!checkinDate || !checkoutDate) return true;
    if (totalRooms === 0) return false;
    let currentDate = new Date(checkinDate);
    while (currentDate < checkoutDate) {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      if (
        unavailableDates.some(
          (unavailableDate) =>
            isValid(unavailableDate) && currentDate.toDateString() === unavailableDate.toDateString()
        ) ||
        availableRoomsByDate[dateStr] === 0
      ) {
        return false;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return true;
  };

  // Handle booking
  const handleBooking = async () => {
    if (!token || !room_class_id || numRooms < 1 || !checkinDate || !checkoutDate || bookingAmount <= 0) {
      toast.error("All fields are required!");
      return;
    }
    const availableRooms = getAvailableRoomsForRange();
    if (numRooms > availableRooms) {
      toast.error(`Only ${availableRooms} rooms available for selected dates!`);
      return;
    }
    if (!isDateRangeValid()) {
      toast.error(
        totalRooms === 0 ? "No rooms available due to maintenance!" : "Selected date range includes unavailable dates!"
      );
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("token", token);
    formData.append("room_class_id", room_class_id);
    formData.append("num_rooms", numRooms);
    formData.append("checkin_date", format(checkinDate, "yyyy-MM-dd"));
    formData.append("checkout_date", format(checkoutDate, "yyyy-MM-dd"));
    formData.append("booking_amount", bookingAmount);

    try {
      const response = await fetch(`${baseUrl}bookRoom.php`, { method: "POST", body: formData });
      const result = await response.json();
      setLoading(false);

      if (result.success) {
        toast.success("Booking created! Redirecting to payment...");
        await fetchAvailability();
        if (result.payment_url) window.location.href = result.payment_url;
        else toast.error("Payment URL not found");
      } else {
        toast.error(`Booking failed: ${result.message}`);
      }
    } catch (error) {
      setLoading(false);
      toast.error(`Booking failed: ${error.message}`);
    }
  };

  // Custom date class for DatePicker
  const getDateClass = ({ date }) => {
    if (!isValid(date)) return "";
    const dateStr = format(date, "yyyy-MM-dd");
    const isUnavailable =
      totalRooms === 0 ||
      unavailableDates.some(
        (unavailableDate) => isValid(unavailableDate) && date.toDateString() === unavailableDate.toDateString()
      ) ||
      availableRoomsByDate[dateStr] === 0;
    return isUnavailable ? "bg-red-100 font-semibold cursor-not-allowed" : "bg-green-50 hover:bg-green-100";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors duration-200"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back
        </button>

        {roomDetails ? (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Section: Room Details and Booking Form */}
            <div className="flex-1 bg-white rounded-xl shadow-md p-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">{roomDetails.class_name}</h2>
              {roomDetails.images?.length > 0 ? (
                <Carousel showThumbs={false} autoPlay infiniteLoop className="mb-6">
                  {roomDetails.images.map((image, index) => (
                    <div key={index}>
                      <img
                        src={`${baseUrl}${image}`}
                        alt={`Room ${index + 1}`}
                        className="w-full h-80 object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </Carousel>
              ) : (
                <p className="text-gray-500 text-center mb-6">No images available</p>
              )}
              <div>
                <p className="text-xl font-semibold text-gray-700 mb-2">
                  Price: Rs {roomDetails.base_price.toLocaleString()} / night
                </p>
                <p className="text-lg text-gray-600 mb-2">
                  Available Rooms: {getAvailableRoomsForRange()}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Select check-in and check-out dates to view exact availability
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-in Date</label>
                <DatePicker
                  selected={checkinDate}
                  onChange={(date) => {
                    setCheckinDate(date);
                    setCheckoutDate(null);
                    setNumRooms(1);
                  }}
                  minDate={new Date()}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select check-in date"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  dayClassName={getDateClass}
                  excludeDates={unavailableDates}
                />
                <label className="block text-sm font-medium text-gray-700 mt-4 mb-1">Check-out Date</label>
                <DatePicker
                  selected={checkoutDate}
                  onChange={(date) => {
                    setCheckoutDate(date);
                    setNumRooms(1);
                  }}
                  minDate={checkinDate ? addDays(checkinDate, 1) : new Date()}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select check-out date"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  disabled={!checkinDate}
                  dayClassName={getDateClass}
                  excludeDates={unavailableDates}
                />
                <label className="block text-sm font-medium text-gray-700 mt-4 mb-1">Number of Rooms</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setNumRooms(numRooms > 1 ? numRooms - 1 : 1)}
                    className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-lg font-medium">{numRooms}</span>
                  <button
                    onClick={() =>
                      setNumRooms(numRooms < getAvailableRoomsForRange() ? numRooms + 1 : numRooms)
                    }
                    className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    +
                  </button>
                </div>
                <h3 className="text-2xl font-bold text-blue-600 mt-6">
                  Total: Rs {bookingAmount.toLocaleString()}
                </h3>
                <button
                  onClick={handleBooking}
                  disabled={loading || bookingAmount <= 0 || !isDateRangeValid()}
                  className={`mt-6 w-full py-3 text-white rounded-lg font-semibold transition-all ${
                    loading || bookingAmount <= 0 || !isDateRangeValid()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {loading ? "Processing..." : "Book Now"}
                </button>
              </div>
            </div>

            {/* Right Section: Availability Calendar */}
            <div className="w-full lg:w-96 bg-white rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Availability Calendar</h3>
                <button
                  onClick={() => fetchAvailability(true)}
                  disabled={calendarLoading}
                  className={`px-4 py-2 rounded-lg text-white font-medium transition-all ${
                    calendarLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {calendarLoading ? "Refreshing..." : "Refresh"}
                </button>
              </div>
              {calendarLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <DatePicker
                  selected={null}
                  inline
                  minDate={new Date()}
                  dateFormat="yyyy-MM-dd"
                  dayClassName={getDateClass}
                  excludeDates={unavailableDates}
                />
              )}
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-50 border border-green-200"></div>
                  <span className="text-sm text-gray-600">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 border border-red-200"></div>
                  <span className="text-sm text-gray-600">Unavailable</span>
                </div>
              </div>
              {lastRefresh && (
                <p className="text-sm text-gray-500 mt-2">Last updated: {format(lastRefresh, "PPp")}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookRoom;
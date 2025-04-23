import { useState } from "react";
import { baseUrl } from "../../constants";

const RoomSearch = ({ onSearch, rooms }) => {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!checkIn || !checkOut) {
      setError("Please select both check-in and check-out dates.");
      return;
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      setError("Check-out date must be after check-in date.");
      return;
    }

    setLoading(true);
    setError("");

    const queryParams = new URLSearchParams({
      check_in: checkIn,
      check_out: checkOut,
      guests,
      class_name: className,
    }).toString();

    try {
      const response = await fetch(`${baseUrl}searchRooms.php?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      if (data.success) {
        onSearch(data.data);
      } else {
        setError(data.message);
        onSearch([]);
      }
    } catch (err) {
      setError("Error fetching rooms. Please try again.");
      onSearch([]);
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCheckIn("");
    setCheckOut("");
    setGuests(1);
    setClassName("");
    setError("");
    onSearch(Array.isArray(rooms) ? rooms : []);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex flex-col w-full md:w-auto">
          <label className="text-sm font-semibold text-gray-700 mb-1">Check-in</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
          />
        </div>

        <div className="flex flex-col w-full md:w-auto">
          <label className="text-sm font-semibold text-gray-700 mb-1">Check-out</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
          />
        </div>

        <div className="flex flex-col w-full md:w-auto">
          <label className="text-sm font-semibold text-gray-700 mb-1">Guests</label>
          <select
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
          >
            <option value="1">1 Guest</option>
            <option value="2">2 Guests</option>
            <option value="3">3 Guests</option>
            <option value="4">4 Guests</option>
          </select>
        </div>

        <div className="flex flex-col w-full md:w-auto">
          <label className="text-sm font-semibold text-gray-700 mb-1">Room Class</label>
          <select
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600"
          >
            <option value="">All</option>
            <option value="Standard Room">Standard Room</option>
            <option value="Deluxe Room">Deluxe Room</option>
          </select>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            onClick={handleSearch}
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Searching..." : "Search"}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 rounded-lg font-semibold text-white bg-gray-600 hover:bg-gray-700 transition-all duration-300"
          >
            Reset
          </button>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-center mt-4 text-sm font-medium">{error}</p>
      )}
    </div>
  );
};

export default RoomSearch;
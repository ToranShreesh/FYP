import React, { useState } from 'react';
import { baseUrl } from "../../constants";

const RoomSearch = ({ onSearch, rooms }) => {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1); // Number of guests to match room_classes.no_of_guest
  const [className, setClassName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!checkIn || !checkOut) {
      setError('Please select both check-in and check-out dates.');
      return;
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      setError('Check-out date must be after check-in date.');
      return;
    }

    setLoading(true);
    setError('');

    const queryParams = new URLSearchParams({
      check_in: checkIn,
      check_out: checkOut,
      guests, // Number of guests to match room_classes.no_of_guest
      class_name: className,
    }).toString();

    try {
      const response = await fetch(`${baseUrl}searchRooms.php?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (data.success) {
        onSearch(data.data);
      } else {
        setError(data.message);
        onSearch([]);
      }
    } catch (err) {
      setError('Error fetching rooms. Please try again.');
      onSearch([]);
      console.error('Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCheckIn('');
    setCheckOut('');
    setGuests(1);
    setClassName('');
    setError('');
    onSearch(Array.isArray(rooms) ? rooms : []); // Ensure rooms is an array
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-4 p-6 bg-gray-100 rounded-lg shadow-md justify-center items-center mb-6">
        <div className="flex flex-col">
          <label className="font-semibold text-gray-700 mb-1">Check-in</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-gray-700 mb-1">Check-out</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
          />
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-gray-700 mb-1">Number of Guests</label>
          <select
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
          >
            <option value="1">1 Guest</option>
            <option value="2">2 Guests</option>
            <option value="3">3 Guests</option>
            <option value="4">4 Guests</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-gray-700 mb-1">Room Class</label>
          <select
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
          >
            <option value="">All</option>
            <option value="Standard Room">Standard Room</option>
            <option value="Deluxe Room">Deluxe Room</option>
          </select>
        </div>

        <div className="mt-7 flex gap-2">
          <button
            onClick={handleSearch}
            disabled={loading}
            className={`px-6 py-2 rounded-md text-white font-semibold ${
              loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-800 hover:bg-red-900'
            } transition-colors duration-200`}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-2 rounded-md text-white font-semibold bg-gray-500 hover:bg-gray-600 transition-colors duration-200"
          >
            Reset
          </button>
        </div>
      </div>

      {error && <p className="text-red-600 text-center mb-4">{error}</p>}
    </div>
  );
};

export default RoomSearch;
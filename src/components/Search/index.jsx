import React, { useState } from "react";

const SearchCard = () => {
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [adults, setAdults] = useState("One");
  const [children, setChildren] = useState("One");

  const handleSearch = () => {
    console.log("Searching with:", { checkInDate, checkOutDate, adults, children });
  };

  // Get today's date in yyyy-mm-dd format
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Check Booking Availability</h3>
      <div className="grid grid-cols-5 gap-4">
        {/* Check-in */}
        <div className="flex flex-col">
          <label htmlFor="checkInDate" className="text-sm font-medium mb-1">
            Check-in
          </label>
          <input
            type="date"
            id="checkInDate"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-blue-500"
            placeholder="dd-mm-yyyy"
            min={today} // Prevent past dates
          />
        </div>

        {/* Check-out */}
        <div className="flex flex-col">
          <label htmlFor="checkOutDate" className="text-sm font-medium mb-1">
            Check-out
          </label>
          <input
            type="date"
            id="checkOutDate"
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-blue-500"
            placeholder="dd-mm-yyyy"
            min={checkInDate} // Ensure check-out date is after check-in date
          />
        </div>

        {/* Adults */}
        <div className="flex flex-col">
          <label htmlFor="adults" className="text-sm font-medium mb-1">
            Adult
          </label>
          <select
            id="adults"
            value={adults}
            onChange={(e) => setAdults(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-blue-500"
          >
            {["One", "Two", "Three", "Four", "Five"].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Children */}
        <div className="flex flex-col">
          <label htmlFor="children" className="text-sm font-medium mb-1">
            Children
          </label>
          <select
            id="children"
            value={children}
            onChange={(e) => setChildren(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-blue-500"
          >
            {["One", "Two", "Three", "Four", "Five"].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <div className="flex items-end">
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-teal-500 text-white text-sm font-medium rounded-md hover:bg-teal-600 focus:outline-none"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchCard;

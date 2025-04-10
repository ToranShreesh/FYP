import React from 'react';

const HomeRooms = ({ image, title, price }) => {
  return (
    <div className="border border-gray-300 rounded-lg p-6 text-center w-96 m-6 shadow-lg">
      <img src={image} alt={title} className="w-full h-56 object-cover rounded-md mb-4" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-lg text-gray-700 mb-4">{price}</p>
      <div className="flex justify-around mt-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300">Book Now</button>
        <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition duration-300">View Details</button>
      </div>
    </div>
  );
};

export default HomeRooms;

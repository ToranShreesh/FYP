import React from 'react';
import { useNavigate } from 'react-router-dom';
import { baseUrl } from '../../constants';

const HomeRooms = ({ rooms, loading, error }) => {
  const navigate = useNavigate();

  // Loading state
  if (loading) {
    return <div className="text-center py-10 text-gray-600">Loading...</div>;
  }

  // Error state
  if (error) {
    return <div className="text-center py-10 text-red-600">Error: {error}</div>;
  }

  // No rooms state
  if (!Array.isArray(rooms) || rooms.length === 0) {
    return <div className="text-center py-10 text-gray-600">No rooms available.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {rooms.map((room) => (
          <div
            key={room.room_class_id}
            className="bg-white shadow-md rounded-md overflow-hidden"
          >
            {/* Image Section */}
            <div className="relative">
              <img
                src={
                  room.images && room.images.length > 0
                    ? `${baseUrl}${room.images[0]}`
                    : '/default-room.jpg'
                }
                alt={room.class_name}
                className="w-full h-[200px] object-cover"
                loading="lazy"
              />
            </div>

            {/* Details Section */}
            <div className="p-6">
              <h3 className="text-xl font-serif font-bold text-[#8B1E3F] mb-2">
                {room.class_name}
              </h3>
              <p className="text-gray-600 mb-2 text-justify">{room.description}</p>
              <p className="text-[#8B1E3F] mb-4 font-bold ">
                Rs {room.basePrice} <span className="text-sm font-bold text-[#8B1E3F]">per night</span>
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => navigate(`/book/${room.room_class_id}`)}
                  className="inline-block px-4 py-2 bg-amber-500 text-white font-medium rounded-md hover:bg-amber-600 transition-transform transform hover:scale-105"
                  aria-label={`Book ${room.class_name} now`}
                >
                  Book Now
                </button>
                <button
                  onClick={() => navigate(`/room/${room.room_class_id}`)}
                  className="inline-block px-4 py-2 border-2 border-amber-500 text-amber-500 font-medium rounded-md hover:bg-amber-50 transition-transform transform hover:scale-105"
                  aria-label={`View details for ${room.class_name}`}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeRooms;
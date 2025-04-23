import { useNavigate } from "react-router-dom";
import { baseUrl } from "../../constants";

const RoomCard = ({
  room_class_id,
  class_name,
  description,
  images,
  basePrice,
  amenities,
}) => {
  const navigate = useNavigate();
  const firstImage = images && images.length > 0 ? `${baseUrl}${images[0]}` : "/default-room.jpg";

  const parseData = (data) => {
    try {
      return JSON.parse(data.replace(/\\"/g, '"').replace(/\\\\/g, "\\"));
    } catch {
      return [];
    }
  };

  const parsedAmenities = Array.isArray(amenities) ? amenities : parseData(amenities);
  const topAmenities = parsedAmenities.slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto mb-8">
      <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
        <div className="flex flex-col lg:flex-row h-auto lg:h-[450px]">
          {/* Image Section */}
          <div className="w-full lg:w-3/5 h-64 lg:h-full relative">
            <img
              src={firstImage}
              alt={class_name}
              className="w-full h-full object-cover rounded-t-xl lg:rounded-t-none lg:rounded-l-xl"
              onError={(e) => (e.target.src = "/default-room.jpg")}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>

          {/* Details Section */}
          <div className="w-full lg:w-2/5 p-6 lg:p-8 flex flex-col">
            {/* Room Title & Price */}
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-serif font-bold text-gray-800">{class_name}</h2>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">Rs {basePrice.toLocaleString()}</div>
                <span className="text-sm text-gray-500">per night</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <p className="text-gray-600 leading-relaxed line-clamp-3">{description}</p>
            </div>

            {/* Amenities */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Room Amenities</h3>
              <div className="grid grid-cols-2 gap-3">
                {topAmenities.slice(0, 4).map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                    <span className="text-sm text-gray-600">{amenity}</span>
                  </div>
                ))}
              </div>
              {parsedAmenities.length > 4 && (
                <button className="text-sm text-blue-600 font-medium mt-3 hover:text-blue-700 transition-colors duration-200">
                  + {parsedAmenities.length - 4} more
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-auto">
              <button
                onClick={() => navigate(`/book/${room_class_id}`)}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold text-sm transition-all duration-300 hover:bg-blue-700 hover:shadow-md"
              >
                Book Now
              </button>
              <button
                onClick={() => navigate(`/room/${room_class_id}`)}
                className="flex-1 py-3 rounded-lg font-semibold text-sm border-2 border-blue-600 text-blue-600 transition-all duration-300 hover:bg-blue-50 hover:shadow-md"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
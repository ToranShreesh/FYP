import { useNavigate } from "react-router-dom";
import { baseUrl } from "../../constants";

const RoomCard = ({
  room_class_id,
  class_name,
  description,
  images,
  basePrice,
  amenities, // Updated from facilities to amenities
}) => {
  
  const navigate = useNavigate();

  const firstImage = images && images.length > 0 ? `${baseUrl}${images[0]}` : "/default-room.jpg";

  const parseData = (data) => {
    try {
      // Remove extra escape characters and parse JSON
      return JSON.parse(data.replace(/\\"/g, '"').replace(/\\\\/g, "\\")); 
    } catch {
      return [];
    }
  };
  
  


  const parsedAmenities = Array.isArray(amenities) ? amenities : parseData(amenities);

  // Limit amenities to the top 5
  const topAmenities = parsedAmenities.slice(0, 5);
  
  

  return (
    <div className="max-w-7xl mx-auto">
  <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
    <div className="flex flex-col lg:flex-row h-[500px]">
      {/* Image Section */}
      <div className="w-full lg:w-3/5 h-full relative">
        <img 
          src={firstImage} 
          alt={class_name} 
          className="h-full w-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"/>
      </div>

      {/* Details Section */}
      <div className="w-full lg:w-2/5 p-8">
        {/* Room Title & Price */}
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{class_name}</h2>
          <div className="text-right">
            <div className="text-2xl font-bold text-red-800">Rs {basePrice}</div>
            <span className="text-sm font-bold text-gray-500">per night</span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>

        {/* Amenities */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Room Amenities</h3>
          <div className="grid grid-cols-2 gap-2">
            {topAmenities.slice(0, 4).map((amenity, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-800 rounded-full"></span>
                <span className="text-sm text-gray-700">{amenity}</span>
              </div>
            ))}
          </div>
          {parsedAmenities.length > 4 && (
            <button className="text-sm text-red-800 font-medium mt-2 hover:text-red-900">
              + {parsedAmenities.length - 4} more
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-auto">
          <button
            onClick={() => navigate(`/book/${room_class_id}`)}
            className="flex-1 bg-red-800 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:bg-red-900 hover:shadow-lg text-sm"
          >
            Book Now
          </button>
          <button
            onClick={() => navigate(`/room/${room_class_id}`)}
            className="flex-1 py-3 rounded-xl font-semibold border-2 border-red-800 text-red-800 transition-all duration-300 hover:bg-red-50 text-sm"
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
   
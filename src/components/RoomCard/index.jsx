import { useNavigate } from "react-router-dom";
import { baseUrl } from "../../constants";

const RoomCard = ({
  room_class_id,
  class_name,
  description,
  images,
  basePrice,
  features,
  facilities,
}) => {
  const navigate = useNavigate();

  const firstImage = images && images.length > 0 ? `${baseUrl}${images[0]}` : "/default-room.jpg";

  const parseData = (data) => {
    try {
      return JSON.parse(data.replace(/\\/g, ""));
    } catch {
      return [];
    }
  };

  const parsedFeatures = Array.isArray(features) ? features : parseData(features);
  const parsedFacilities = Array.isArray(facilities) ? facilities : parseData(facilities);

  return (
    <div className="flex flex-row bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 mb-6">
      {/* Image Section */}
      <div className="w-1/2">
        <img src={firstImage} alt={class_name} className="h-full w-full object-cover" />
      </div>

      {/* Room Details Section */}
      <div className="w-1/2 p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">{class_name}</h2>
          <p className="text-gray-600 mt-2">{description}</p>
          <p className="text-xl font-medium text-green-600 mt-2">Rs {basePrice} per night</p>

          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-700">Features:</h3>
            <ul className="text-gray-600 list-disc list-inside">
              {parsedFeatures.length > 0 ? parsedFeatures.map((feature, index) => <li key={index}>{feature}</li>) : <li>No features available</li>}
            </ul>
          </div>

          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-700">Facilities:</h3>
            <ul className="text-gray-600 list-disc list-inside">
              {parsedFacilities.length > 0 ? parsedFacilities.map((facility, index) => <li key={index}>{facility}</li>) : <li>No facilities available</li>}
            </ul>
          </div>
        </div>

        {/* Button Section */}
        <div className="flex justify-between mt-6">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-blue-700"
            onClick={() => navigate(`/book/${room_class_id}`)}
          >
            Book Now
          </button>
          <button
            className="border border-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition hover:bg-gray-200"
            onClick={() => navigate(`/room/${room_class_id}`)}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;

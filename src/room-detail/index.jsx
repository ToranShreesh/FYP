import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { baseUrl } from "../constants";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import ReviewCard from "../components/ReviewCard";

const RoomDetailPage = () => {
  const { room_class_id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAllRules, setShowAllRules] = useState(false);

  const navigate = useNavigate();

  const parseData = (data) => {
    try {
      return JSON.parse(data.replace(/\\"/g, '"').replace(/\\\\/g, "\\")); 
    } catch {
      return [];
    }
  };

  useEffect(() => {
    fetch(`${baseUrl}getRoomDetail.php?room_class_id=${room_class_id}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setRoom(data.room_class);
        } else {
          setError(true);
        }
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [room_class_id]);

  if (loading) {
    return <p className="text-gray-500 text-lg animate-pulse">Loading room details...</p>;
  }

  if (error || !room) {
    return <p className="text-red-500 text-lg font-semibold">Room not found. Please try again later.</p>;
  }

  const parsedAmenities = Array.isArray(room.amenities) ? room.amenities : parseData(room.amenities);
  const images = room.images || [];
  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const hotelRules = [
    "Check-in time: 2:00 PM - Check-out time: 12:00 PM",
    "Primary guest should be atleast 18 years of age",
    "Passport, Nagrita and Driving License are accepted as ID proof(s)",
    "Valid ID is required at check-in.",
    "Pets are not allowed.",
    "Smoking is prohibited in all rooms.",
    "There are no restrictions on alcohol consumption.",
    "Smoking within the premises is allowed",
    "This property is accessible to guests who use a wheelchair. Guests are requested to carry their own wheelchair.",
    "Outside food is allowed.",
    "Unmarried couples are allowed.",
    "Guests must follow all hotel policies during their stay.",
    "You can pay now or you can pay at the hotel if your selected room type has this option."
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mt-20 mx-auto p-6 max-w-5xl">
        <h1 className="text-4xl font-extrabold text-gray-800 text-center">{room.class_name}</h1>

        {/* Image Slider */}
        <div className="mt-8 relative w-full max-w-3xl mx-auto">
          {images.length > 0 && (
            <>
              <img
                src={`${baseUrl}${images[currentImageIndex]}`}
                alt="Room"
                className="w-full h-80 object-cover rounded-lg shadow-md cursor-pointer"
                onClick={() => setIsModalOpen(true)}
              />
              <button
                className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"
                onClick={prevImage}
              >
                <FaChevronLeft size={20} />
              </button>
              <button
                className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full"
                onClick={nextImage}
              >
                <FaChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {/* Room Details */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
          <p className="text-gray-700 leading-relaxed text-lg">{room.description}</p>
          <p className="text-3xl font-bold text-green-600 mt-4">Rs {room.base_price} per night</p>
          <button
            className="mt-6 w-full px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300 text-xl font-semibold"
            onClick={() => navigate(`/book/${room_class_id}`)}
          >
            Book Now
          </button>
        </div>

        {/* Amenities */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">Amenities</h3>
          <ul className="grid grid-cols-3 gap-4">
            {parsedAmenities.length > 0 ? (
              parsedAmenities.map((amenity, index) => (
                <li key={index} className="flex items-center gap-2"> 
                  <span className="w-2 h-2 bg-yellow-500 rounded-sm"></span>
                  <span className="text-gray-700">{amenity}</span>
                </li>
              )) 
            ) : (
              <li className="text-gray-500">No amenities available</li>
            )}
          </ul>
        </div>

        {/* Features Section */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">Features</h3>
          <div className="grid grid-cols-2 gap-4 text-gray-700">
            <div><span className="font-semibold text-red-800 text-lg">Room Size :</span> {room.room_size} sq. ft.</div>
            <div><span className="font-semibold text-red-800 text-lg">Bed Type :</span> {room.bed_type}</div>
            <div><span className="font-semibold text-red-800 text-lg">Occupancy :</span> Up to {room.occupancy} people</div>
            <div><span className="font-semibold text-red-800 text-lg">Smoking :</span> {room.smoking === 1 ? "Yes" : "No"}</div>
            <div><span className="font-semibold text-red-800 text-lg">Drinks :</span> {room.drinks === 1 ? "Yes" : "No"}</div>
          </div>
        </div>

        {/* Hotel Rules (Collapsible) */}
        <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold text-gray-800">Hotel Rules</h3>
          <ul className="mt-4 space-y-2 text-lg text-gray-700">
            {hotelRules.slice(0, showAllRules ? hotelRules.length : 3).map((rule, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-sm"></span>
                {rule}
              </li>
            ))}
          </ul>
          <button
            className="mt-4 text-blue-600 font-semibold flex items-center"
            onClick={() => setShowAllRules(!showAllRules)}
          >
            {showAllRules ? "View Less" : "View More"}
            {showAllRules ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
          </button>
        </div>

        {/* Add Review Section */}
        <ReviewCard room_class_id={room_class_id} />
      </div>

      {/* Modal for Full Screen Image */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50" onClick={() => setIsModalOpen(false)}>
          <div className="relative w-full h-full max-w-full">
            <img
              src={`${baseUrl}${images[currentImageIndex]}`}
              alt="Full Screen Room"
              className="w-full h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-4 right-4 bg-white text-gray-800 p-2 rounded-full"
              onClick={() => setIsModalOpen(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default RoomDetailPage;
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { baseUrl } from "../constants";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaChevronLeft, FaChevronRight, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import ReviewCard from "../components/ReviewCard";

const RoomDetailPage = () => {
  const { room_class_id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAllRules, setShowAllRules] = useState(false);

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
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <p className="text-red-500 text-lg font-semibold">Room not found. Please try again later.</p>
      </div>
    );
  }

  const parsedAmenities = Array.isArray(room.amenities) ? room.amenities : parseData(room.amenities);
  const images = room.images || [];
  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const hotelRules = [
    "Check-in time: 2:00 PM - Check-out time: 12:00 PM",
    "Primary guest should be at least 18 years of age",
    "Passport, Nagrita, and Driving License are accepted as ID proof(s)",
    "Valid ID is required at check-in",
    "Pets are not allowed",
    "Smoking is prohibited in all rooms",
    "There are no restrictions on alcohol consumption",
    "Smoking within the premises is allowed",
    "This property is accessible to guests who use a wheelchair. Guests are requested to carry their own wheelchair",
    "Outside food is allowed",
    "Unmarried couples are allowed",
    "Guests must follow all hotel policies during their stay",
    "You can pay now or pay at the hotel if your selected room type has this option",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 mt-20">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors duration-200"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back
        </button>

        <h1 className="text-4xl font-bold text-gray-800 text-center mb-8">{room.class_name}</h1>

        {/* Image Slider */}
        <div className="relative w-full max-w-3xl mx-auto mb-8">
          {images.length > 0 ? (
            <>
              <img
                src={`${baseUrl}${images[currentImageIndex]}`}
                alt="Room"
                className="w-full h-96 object-cover rounded-xl shadow-lg cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                onClick={() => setIsModalOpen(true)}
              />
              <button
                className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all"
                onClick={prevImage}
              >
                <FaChevronLeft size={20} />
              </button>
              <button
                className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all"
                onClick={nextImage}
              >
                <FaChevronRight size={20} />
              </button>
            </>
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-xl flex items-center justify-center">
              <p className="text-gray-500">No images available</p>
            </div>
          )}
        </div>

        {/* Room Details */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <p className="text-gray-600 leading-relaxed text-lg mb-4">{room.description}</p>
          <p className="text-3xl font-bold text-blue-600 mb-6">Rs {room.base_price.toLocaleString()} / night</p>
          <button
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 text-xl"
            onClick={() => navigate(`/book/${room_class_id}`)}
          >
            Book Now
          </button>
        </div>

        {/* Amenities */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Amenities</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {parsedAmenities.length > 0 ? (
              parsedAmenities.map((amenity, index) => (
                <li key={index} className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span className="text-gray-600">{amenity}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-500">No amenities available</li>
            )}
          </ul>
        </div>

        {/* Features Section */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600">
            <div>
              <span className="font-semibold text-blue-700">Room Size:</span> {room.room_size} sq. ft.
            </div>
            <div>
              <span className="font-semibold text-blue-700">Bed Type:</span> {room.bed_type}
            </div>
            <div>
              <span className="font-semibold text-blue-700">Occupancy:</span> Up to {room.occupancy} people
            </div>
            <div>
              <span className="font-semibold text-blue-700">Smoking:</span> {room.smoking === 1 ? "Yes" : "No"}
            </div>
            <div>
              <span className="font-semibold text-blue-700">Drinks:</span> {room.drinks === 1 ? "Yes" : "No"}
            </div>
          </div>
        </div>

        {/* Hotel Rules (Collapsible) */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Hotel Rules</h3>
          <ul className="space-y-3 text-gray-600">
            {hotelRules.slice(0, showAllRules ? hotelRules.length : 3).map((rule, index) => (
              <li key={index} className="flex items-center gap-3">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                {rule}
              </li>
            ))}
          </ul>
          <button
            className="mt-4 text-blue-600 font-semibold flex items-center hover:text-blue-700 transition-colors"
            onClick={() => setShowAllRules(!showAllRules)}
          >
            {showAllRules ? "View Less" : "View More"}
            {showAllRules ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
          </button>
        </div>

        {/* Review Section */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-2xl font-semibold text-gray-800 mb-4">Guest Reviews</h3>
          <ReviewCard room_class_id={room_class_id} />
        </div>
      </div>

      {/* Modal for Full Screen Image */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative w-full max-w-4xl">
            <img
              src={`${baseUrl}${images[currentImageIndex]}`}
              alt="Full Screen Room"
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-4 right-4 bg-white text-gray-800 p-2 rounded-full shadow-md hover:bg-gray-100 transition-all"
              onClick={() => setIsModalOpen(false)}
            >
              <span className="text-xl">×</span>
            </button>
            <button
              className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
            >
              <FaChevronLeft size={20} />
            </button>
            <button
              className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-75 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
            >
              <FaChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default RoomDetailPage;
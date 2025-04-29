import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoomCard from "../components/RoomCard";
import { baseUrl } from "../constants";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RoomSearch from "../components/RoomSearch";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const RoomPage = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(baseUrl + "getRoomAndClass.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const fetchedRooms = data.room_classes || [];
          setRooms(fetchedRooms);
          setFilteredRooms(fetchedRooms);
        } else {
          setError("Failed to load room data.");
          console.error("Error fetching rooms:", data.message);
          setRooms([]);
          setFilteredRooms([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        setError("An error occurred while fetching data.");
        console.error("API Error:", error);
        setRooms([]);
        setFilteredRooms([]);
        setLoading(false);
      });
  }, []);

  const handleSearchResults = (searchResults) => {
    setFilteredRooms(Array.isArray(searchResults) ? searchResults : []);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      

      {/* Hero Section */}
      <div className="relative w-full h-[600px]">
        <img
          src="/assets/Room.jpg"
          alt="Rooms Banner"
          className="w-full h-full object-cover"
          onError={(e) => (e.target.src = "/default-room.jpg")}
        />
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl md:text-6xl font-serif font-bold tracking-tight drop-shadow-md">
              Our Rooms & Rates
            </h1>
            <p className="mt-4 text-xl md:text-2xl font-light max-w-3xl mx-auto drop-shadow-md">
              Discover luxurious accommodations tailored to your comfort and style.
            </p>
          </div>
        </div>
      </div>

      {/* Search and Rooms Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <RoomSearch onSearch={handleSearchResults} rooms={rooms} />
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-800 mb-12 mt-16">
            Available Rooms
          </h2>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <p className="text-center text-red-500 text-lg font-medium">{error}</p>
          ) : Array.isArray(filteredRooms) && filteredRooms.length > 0 ? (
            <div className="flex flex-col gap-12">
              {filteredRooms.map((room) => (
                <RoomCard
                  key={room.room_class_id}
                  room_class_id={room.room_class_id}
                  class_name={room.class_name}
                  description={room.description}
                  images={room.images}
                  basePrice={room.basePrice}
                  amenities={room.amenities}
                  room_size={room.room_size}
                  drinks={room.drinks}
                  smoking={room.smoking}
                  bed_type={room.bed_type}
                  no_of_guest={room.no_of_guest}
                />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 text-lg font-medium">
              No rooms available.
            </p>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default RoomPage;
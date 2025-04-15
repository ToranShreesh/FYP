import { useEffect, useState } from "react";
import RoomCard from "../components/RoomCard";
import { baseUrl } from "../constants";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RoomSearch from "../components/RoomSearch";

const RoomPage = () => {
  const [rooms, setRooms] = useState([]); // Initial state is an empty array
  const [filteredRooms, setFilteredRooms] = useState([]); // Initial state is an empty array
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
          setRooms([]); // Ensure rooms is an array even on failure
          setFilteredRooms([]); // Ensure filteredRooms is an array even on failure
        }
        setLoading(false);
      })
      .catch((error) => {
        setError("An error occurred while fetching data.");
        console.error("API Error:", error);
        setRooms([]); // Ensure rooms is an array even on failure
        setFilteredRooms([]); // Ensure filteredRooms is an array even on failure
        setLoading(false);
      });
  }, []);

  const handleSearchResults = (searchResults) => {
    setFilteredRooms(Array.isArray(searchResults) ? searchResults : []); // Ensure searchResults is an array
  };

  return (
    <>
      <Navbar />
      <div className="relative w-full h-96 mt-20">
        <img
          src="./assets/Room.jpg"
          alt="Rooms Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <h1 className="text-white text-2xl md:text-3xl font-semibold">
            OUR ROOMS AND RATE
          </h1>
        </div>
      </div>
      <RoomSearch onSearch={handleSearchResults} rooms={rooms} />
      <div className="container mt-10 mx-auto p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Available Rooms</h2>
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : Array.isArray(filteredRooms) && filteredRooms.length > 0 ? ( // Add guard for filteredRooms
          <div className="flex flex-col gap-6">
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
          <p className="text-center text-gray-500">No rooms available.</p>
        )}
      </div>
      <Footer />
    </>
  );
};

export default RoomPage;
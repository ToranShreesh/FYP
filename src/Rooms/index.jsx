import { useEffect, useState } from "react";
import RoomCard from "../components/RoomCard";
import { baseUrl } from "../constants";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const RoomPage = () => {
  const [rooms, setRooms] = useState([]);
  const [roomClasses, setRoomClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(baseUrl + "getRoomAndClass.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setRoomClasses(data.room_classes || []);
          setRooms(data.rooms || []);
        } else {
          setError("Failed to load room data.");
          console.error("Error fetching rooms:", data.message);
        }
        setLoading(false);
      })
      .catch((error) => {
        setError("An error occurred while fetching data.");
        console.error("API Error:", error);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Navbar />

      {/* Banner Section */}
      <div className="relative w-full h-96 mt-20">
        <img
          src="./assets/Room.jpg" // Replace with actual image path
          alt="Rooms Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <h1 className="text-white text-2xl md:text-3xl font-semibold">
            OUR ROOMS AND RATE
          </h1>
        </div>
      </div>

      {/* Available Rooms Section */}
      <div className="container mt-10 mx-auto p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Available Rooms</h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="flex flex-col gap-6">
            {roomClasses.length > 0 ? (
              roomClasses.map((room) => (
                <RoomCard
                key={room.room_class_id}
                room_class_id={room.room_class_id}
                class_name={room.class_name}
                description={room.description}
                images={room.images}
                basePrice={room.base_price}
                amenities={room.amenities} 
              />
              
              ))
            ) : (
              <p className="text-center text-gray-500">No rooms available.</p>
            )}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default RoomPage;

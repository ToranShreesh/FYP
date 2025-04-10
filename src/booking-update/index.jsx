import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { baseUrl } from "../constants";
import toast from "react-hot-toast";

const BookingUpdate = () => {
    const { booking_id } = useParams();
    const [token, setToken] = useState("");
    const [bookingDetails, setBookingDetails] = useState(null);
    const [roomsToAdd, setRoomsToAdd] = useState(0);
    const [currentRoomsBooked, setCurrentRoomsBooked] = useState(0);
    const [pricePerRoom, setPricePerRoom] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [availableRooms, setAvailableRooms] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) setToken(storedToken);
        else toast.error("Please log in first!");
    }, []);

    useEffect(() => {
        const fetchBookingDetails = async () => {
            try {
                const response = await fetch(`${baseUrl}getBookingDetail.php?booking_id=${booking_id}`);
                const data = await response.json();
                if (data.success) {
                    setBookingDetails(data.booking);
                    setPricePerRoom(data.booking.base_price);
                    setAvailableRooms(data.booking.available_rooms);
                    setCurrentRoomsBooked(data.booking.num_rooms);
                } else {
                    toast.error("Failed to fetch booking details");
                }
            } catch (error) {
                console.error("Error fetching booking details:", error);
                toast.error("Error fetching booking details");
            }
        };
        fetchBookingDetails();
    }, [booking_id]);

    useEffect(() => {
        setTotalPrice(roomsToAdd * pricePerRoom);
    }, [roomsToAdd, pricePerRoom]);

    const handleUpdateBooking = async () => {
        if (!token) {
            toast.error("User token is missing! Please log in.");
            return;
        }
        if (!booking_id) {
            toast.error("Booking ID is missing!");
            return;
        }
        if (roomsToAdd < 1) {
            toast.error("You must add at least 1 room.");
            return;
        }
        if (roomsToAdd > availableRooms) {
            toast.error("Cannot book more rooms than available!");
            return;
        }
        if (totalPrice <= 0) {
            toast.error("Invalid total price! Please check price per room.");
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append("token", token);
        formData.append("booking_id", booking_id);
        formData.append("added_rooms", roomsToAdd);
        formData.append("base_price", pricePerRoom);

        try {
            const response = await fetch(`${baseUrl}updateBooking.php`, {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            setLoading(false);
            if (result.success) {
                toast.success("Rooms added successfully!");

                // **Update UI after successful booking**
                setCurrentRoomsBooked((prev) => prev + roomsToAdd); // Increase booked rooms
                setAvailableRooms((prev) => prev - roomsToAdd); // Decrease available rooms
                setRoomsToAdd(0); // Reset input field
            } else {
                toast.error(`Failed: ${result.message}`);
            }
        } catch (error) {
            setLoading(false);
            console.error("Error:", error);
            toast.error("Booking update failed, try again!");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            {bookingDetails ? (
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h2 className="text-3xl font-bold text-center text-gray-800">
                        Add Rooms to Booking #{booking_id}
                    </h2>

                    <p className="text-xl font-semibold text-gray-700 mt-4">
                        <strong>Room Type:</strong> {bookingDetails.class_name}
                    </p>

                    <p className="text-xl font-semibold text-gray-700 mt-2">
                        <strong>Price Per Room:</strong> Rs {pricePerRoom}
                    </p>

                    <p className="text-xl font-semibold text-gray-700 mt-2">
                        <strong>Current Rooms Booked:</strong> {currentRoomsBooked}
                    </p>

                    <p className="text-xl font-semibold text-gray-700 mt-2">
                        <strong>Available Rooms:</strong> {availableRooms}
                    </p>

                    <label className="block mt-4">Number of Rooms to Add:</label>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setRoomsToAdd((prev) => Math.max(prev - 1, 0))}
                            className="bg-gray-200 px-3 py-1 rounded-lg"
                        >
                            -
                        </button>
                        <span className="text-xl">{roomsToAdd}</span>
                        <button
                            onClick={() => setRoomsToAdd((prev) => Math.min(prev + 1, availableRooms))}
                            className="bg-gray-200 px-3 py-1 rounded-lg"
                            disabled={roomsToAdd >= availableRooms}
                        >
                            +
                        </button>
                    </div>

                    <h3 className="text-2xl font-bold text-green-600 mt-4">
                        Total: Rs {totalPrice}
                    </h3>

                    <button
                        onClick={handleUpdateBooking}
                        disabled={loading}
                        className={`mt-4 px-6 py-3 text-white rounded-lg shadow-md w-full transition duration-300 ${
                            loading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        {loading ? "Processing..." : "Add Rooms"}
                    </button>
                </div>
            ) : (
                <p className="text-center text-gray-500">Loading booking details...</p>
            )}
        </div>
    );
};

export default BookingUpdate;

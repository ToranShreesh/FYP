import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { baseUrl } from "../constants";
import toast from "react-hot-toast";

const BookingCancel = () => {
    const { booking_id } = useParams();
    const [token, setToken] = useState("");
    const [bookingDetails, setBookingDetails] = useState(null);
    const [numRooms, setNumRooms] = useState(1);
    const [pricePerRoom, setPricePerRoom] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [roomsToCancel, setRoomsToCancel] = useState(0);
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
                    setNumRooms(data.booking.num_rooms);
                    setPricePerRoom(data.booking.base_price);
                    setTotalPrice(data.booking.num_rooms * data.booking.base_price);
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
        setTotalPrice((numRooms - roomsToCancel) * pricePerRoom);
    }, [roomsToCancel, numRooms, pricePerRoom]);

    const handleCancelBooking = async () => {
        if (!token || !booking_id || roomsToCancel < 1 || roomsToCancel >= numRooms) {
            toast.error("Invalid cancellation request!");
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append("token", token);
        formData.append("booking_id", booking_id);
        formData.append("rooms_to_cancel", roomsToCancel);
        formData.append("price_per_room", pricePerRoom);

        try {
            const response = await fetch(`${baseUrl}cancelBooking.php`, {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            setLoading(false);
            if (result.success) {
                toast.success("Rooms canceled successfully!");
                setNumRooms(numRooms - roomsToCancel);
                setRoomsToCancel(0);
            } else {
                toast.error(`Failed: ${result.message}`);
            }
        } catch (error) {
            setLoading(false);
            console.error("Error:", error);
            toast.error("Cancellation failed, try again!");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            {bookingDetails ? (
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h2 className="text-3xl font-bold text-center text-gray-800">
                        Cancel Rooms for Booking #{booking_id}
                    </h2>

                    <p className="text-xl font-semibold text-gray-700 mt-4">
                        <strong>Room Type:</strong> {bookingDetails.class_name}
                    </p>

                    <p className="text-xl font-semibold text-gray-700 mt-2">
                        <strong>Price Per Room:</strong> Rs {pricePerRoom}
                    </p>

                    <p className="text-xl font-semibold text-gray-700 mt-2">
                        <strong>Current Rooms:</strong> {numRooms}
                    </p>

                    <label className="block mt-4">Rooms to Cancel:</label>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setRoomsToCancel(roomsToCancel > 0 ? roomsToCancel - 1 : 0)}
                            className="bg-gray-200 px-3 py-1 rounded-lg"
                        >
                            -
                        </button>
                        <span className="text-xl">{roomsToCancel}</span>
                        <button
                            onClick={() => setRoomsToCancel(roomsToCancel < numRooms - 1 ? roomsToCancel + 1 : roomsToCancel)}
                            className="bg-gray-200 px-3 py-1 rounded-lg"
                        >
                            +
                        </button>
                    </div>

                    <h3 className="text-2xl font-bold text-red-600 mt-4">
                        New Total: Rs {totalPrice}
                    </h3>

                    <button
                        onClick={handleCancelBooking}
                        disabled={loading}
                        className={`mt-4 px-6 py-3 text-white rounded-lg shadow-md w-full transition duration-300 ${
                            loading ? "bg-gray-500 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                        }`}
                    >
                        {loading ? "Processing..." : "Cancel Selected Rooms"}
                    </button>
                </div>
            ) : (
                <p className="text-center text-gray-500">Loading booking details...</p>
            )}
        </div>
    );
};

export default BookingCancel;

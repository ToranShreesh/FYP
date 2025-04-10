import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import { Carousel } from "react-responsive-carousel";
import "react-datepicker/dist/react-datepicker.css";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { addDays, format } from "date-fns";
import { baseUrl } from "../constants";
import toast from "react-hot-toast";

const BookRoom = () => {
    const { room_class_id } = useParams();
    const [token, setToken] = useState("");
    const [roomDetails, setRoomDetails] = useState(null);
    const [numRooms, setNumRooms] = useState(1);
    const [checkinDate, setCheckinDate] = useState(null);
    const [checkoutDate, setCheckoutDate] = useState(null);
    const [bookingAmount, setBookingAmount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Set token from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) setToken(storedToken);
        else toast.error("Please log in first!");
    }, []);

    // Fetch room details
    useEffect(() => {
        const fetchRoomDetails = async () => {
            try {
                const response = await fetch(`${baseUrl}getRoomDetail.php?room_class_id=${room_class_id}`);
                const data = await response.json();
                if (data.success) setRoomDetails(data.room_class);
                else toast.error("Failed to fetch room details");
            } catch (error) {
                toast.error("Error fetching room details");
            }
        };
        fetchRoomDetails();
    }, [room_class_id]);

    // Update booking amount
    useEffect(() => {
        if (roomDetails && checkinDate && checkoutDate) {
            const days = (checkoutDate - checkinDate) / (1000 * 60 * 60 * 24);
            setBookingAmount(days > 0 ? days * numRooms * roomDetails.base_price : 0);
        }
    }, [checkinDate, checkoutDate, numRooms, roomDetails]);

    // Handle booking
    const handleBooking = async () => {
        if (!token || !room_class_id || numRooms < 1 || !checkinDate || !checkoutDate || bookingAmount <= 0) {
            toast.error("All fields are required!");
            return;
        }
    
        setLoading(true);
    
        const formData = new FormData();
        formData.append("token", token);
        formData.append("room_class_id", room_class_id);
        formData.append("num_rooms", numRooms);
        formData.append("checkin_date", format(checkinDate, "yyyy-MM-dd"));
        formData.append("checkout_date", format(checkoutDate, "yyyy-MM-dd"));
        formData.append("booking_amount", bookingAmount);
    
        try {
            const response = await fetch(`${baseUrl}bookRoom.php`, {
                method: "POST",
                body: formData,
            });
    
            const result = await response.json();
            setLoading(false);
    
            if (result.success) {
                toast.success("Booking created! Redirecting to payment...");
                if (result.payment_url) {
                    window.location.href = result.payment_url; // Redirect to Khalti payment page
                } else {
                    toast.error("Payment URL not found");
                }
            } else {
                toast.error(`Failed: ${result.message}`);
            }
        } catch (error) {
            setLoading(false);
            toast.error("Booking failed, try again!");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            {roomDetails ? (
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h2 className="text-3xl font-bold text-center text-gray-800">{roomDetails.class_name}</h2>

                    {roomDetails.images?.length > 0 ? (
                        <Carousel showThumbs={false} autoPlay infiniteLoop className="mt-4">
                            {roomDetails.images.map((image, index) => (
                                <div key={index}>
                                    <img
                                        src={`${baseUrl}${image}`}
                                        alt={`Room ${index + 1}`}
                                        className="w-full h-72 object-cover rounded-lg"
                                    />
                                </div>
                            ))}
                        </Carousel>
                    ) : (
                        <p className="text-gray-500 text-center mt-4">No images available</p>
                    )}

                    <div className="mt-6">
                        <p className="text-xl font-semibold text-gray-700">
                            <strong>Price:</strong> Rs {roomDetails.base_price} per night
                        </p>

                        <label className="block mt-4">Number of Rooms:</label>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setNumRooms(numRooms > 1 ? numRooms - 1 : 1)}
                                className="bg-gray-200 px-3 py-1 rounded-lg"
                            >
                                -
                            </button>
                            <span className="text-xl">{numRooms}</span>
                            <button
                                onClick={() => setNumRooms(numRooms + 1)}
                                className="bg-gray-200 px-3 py-1 rounded-lg"
                            >
                                +
                            </button>
                        </div>

                        <label className="block mt-4">Check-in Date:</label>
                        <DatePicker
                            selected={checkinDate}
                            onChange={(date) => {
                                setCheckinDate(date);
                                setCheckoutDate(null);
                            }}
                            minDate={new Date()}
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Select check-in date"
                            className="border rounded-lg p-2 w-full"
                        />

                        <label className="block mt-4">Check-out Date:</label>
                        <DatePicker
                            selected={checkoutDate}
                            onChange={(date) => setCheckoutDate(date)}
                            minDate={checkinDate ? addDays(checkinDate, 1) : new Date()}
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Select check-out date"
                            className="border rounded-lg p-2 w-full"
                            disabled={!checkinDate}
                        />

                        <h3 className="text-2xl font-bold text-green-600 mt-4">
                            Total: Rs {bookingAmount}
                        </h3>

                        <button
                            onClick={handleBooking}
                            disabled={loading || bookingAmount <= 0}
                            className={`mt-4 w-full py-2 text-white rounded-lg ${
                                loading ? "bg-gray-500" : "bg-blue-500"
                            }`}
                        >
                            {loading ? "Processing..." : "Book Now"}
                        </button>
                    </div>
                </div>
            ) : (
                <p>Loading room details...</p>
            )}
        </div>
    );
};

export default BookRoom;

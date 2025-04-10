import { useEffect, useState } from "react";
import { baseUrl } from "../../constants";
import toast from "react-hot-toast";

const FacilityCard = ({ facility_id, facility_name, facility_image_url, description }) => {
    const [avgRating, setAvgRating] = useState(null); // Store average rating
    const [userRating, setUserRating] = useState(0); // Store selected user rating
    const [loading, setLoading] = useState(false); // Track loading state
    const token = localStorage.getItem("token"); // Get token from local storage

    const imageUrl = facility_image_url ? `${baseUrl}${facility_image_url}` : "/default-facility.jpg";

    useEffect(() => {
        fetchAverageRating();
    }, []);

    const fetchAverageRating = async () => {
        try {
            const response = await fetch(`${baseUrl}getAverageRating.php?facility_id=${facility_id}`);
            const data = await response.json();
            if (data.success) {
                setAvgRating(data.avg_rating);
            }
        } catch (error) {
            console.error("Error fetching rating:", error);
        }
    };

    const submitRating = async () => {
      if (!token) {
          alert("You must be logged in to submit a rating.");
          return;
      }
      if (userRating === 0) {
          alert("Please select a rating before submitting.");
          return;
      }
  
      setLoading(true);
      try {
          const formData = new FormData();
          formData.append("token", token); 
          formData.append("facility_id", facility_id);
          formData.append("rating", userRating);
  
          const response = await fetch(`${baseUrl}submitRating.php`, {
              method: "POST",
              body: formData,
          });
  
          // Log raw response before JSON parsing
          const textResponse = await response.text();
         
  
          // Try parsing JSON
          const data = JSON.parse(textResponse);
          
  
          if (data.success) {
              setAvgRating(data.avg_rating); // Update displayed rating
              setUserRating(0); // Reset user rating after submission
              toast("Rating submitted successfully!");
          } else {
              toast(data.message);
          }
      } catch (error) {
          console.error("Error submitting rating:", error);
          alert("An error occurred while submitting your rating.");
      } finally {
          setLoading(false);
      }
  };
  

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105 p-4">
            {/* Facility Image */}
            <img src={imageUrl} alt={facility_name} className="w-full h-56 object-cover" />

            {/* Facility Content */}
            <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-900">{facility_name}</h3>
                <p className="text-gray-600 mt-2">{description}</p>

                {/* Display Average Rating */}
                <div className="mt-3 flex items-center">
                    {avgRating !== null ? (
                        <span className="text-lg text-yellow-500">⭐ {avgRating}/5</span>
                    ) : (
                        <span className="text-gray-400">Loading rating...</span>
                    )}
                </div>

                {/* Star Rating Selection */}
                <div className="mt-3 flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            className={`cursor-pointer text-2xl transition-colors ${
                                userRating >= star ? "text-yellow-500" : "text-gray-400"
                            }`}
                            onClick={() => setUserRating(star)}
                        >
                            ★
                        </span>
                    ))}
                </div>

                {/* Submit Button */}
                <button
                    onClick={submitRating}
                    disabled={loading}
                    className={`mt-3 px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                    {loading ? "Submitting..." : "Submit Rating"}
                </button>
            </div>
        </div>
    );
};

export default FacilityCard;

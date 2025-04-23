import { useEffect, useState } from "react";
import { baseUrl } from "../../constants";
import toast from "react-hot-toast";

const FacilityCard = ({ facility_id, facility_name, facility_image_url, description }) => {
  const [avgRating, setAvgRating] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const imageUrl = facility_image_url
    ? `${baseUrl}${facility_image_url}`
    : "/default-facility.jpg";

  useEffect(() => {
    fetchAverageRating();
  }, [facility_id]);

  const fetchAverageRating = async () => {
    try {
      const response = await fetch(`${baseUrl}getAverageRating.php?facility_id=${facility_id}`);
      const data = await response.json();
      if (data.success) {
        setAvgRating(data.avg_rating ? parseFloat(data.avg_rating).toFixed(1) : null);
      }
    } catch (error) {
      console.error("Error fetching rating:", error);
      toast.error("Failed to load rating.");
    }
  };

  const submitRating = async () => {
    if (!token) {
      toast.error("Please log in to submit a rating.");
      return;
    }
    if (userRating === 0) {
      toast.error("Please select a rating.");
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

      const data = await response.json();

      if (data.success) {
        setAvgRating(data.avg_rating ? parseFloat(data.avg_rating).toFixed(1) : null);
        setUserRating(0);
        toast.success("Rating submitted successfully!");
      } else {
        toast.error(data.message || "Failed to submit rating.");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("An error occurred while submitting your rating.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
      {/* Facility Image */}
      <img
        src={imageUrl}
        alt={facility_name}
        className="w-full h-56 object-cover rounded-t-xl"
        onError={(e) => (e.target.src = "/default-facility.jpg")}
      />

      {/* Facility Content */}
      <div className="p-6">
        <h3 className="text-xl font-serif font-semibold text-gray-800 mb-3">{facility_name}</h3>
        <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">{description}</p>

        {/* Display Average Rating */}
        <div className="mb-4 flex items-center">
          {avgRating !== null ? (
            <span className="text-lg text-amber-500 font-medium">
              ⭐ {avgRating}/5
            </span>
          ) : (
            <span className="text-gray-500 text-sm">No ratings yet</span>
          )}
        </div>

        {/* Star Rating Selection */}
        <div className="mb-4 flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`cursor-pointer text-2xl transition-colors duration-200 ${
                userRating >= star ? "text-amber-500" : "text-gray-300"
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
          className={`w-full py-2 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Submitting..." : "Submit Rating"}
        </button>
      </div>
    </div>
  );
};

export default FacilityCard;
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { baseUrl } from "../../constants";
import toast from "react-hot-toast";

const FacilityCard = ({ facility_id, facility_name, facility_image_url, description }) => {
  const [avgRating, setAvgRating] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [canRate, setCanRate] = useState(false);
  const [eligibilityLoading, setEligibilityLoading] = useState(true);
  const token = localStorage.getItem("token");
  const imageUrl = facility_image_url
    ? `${baseUrl}${facility_image_url}`
    : "/default-facility.jpg";

  // Log token and facility_id once
  useEffect(() => {
    console.log(`FacilityCard mounted - Facility ID: ${facility_id}, Token: ${token || 'null'}`);
    return () => console.log(`FacilityCard unmounted - Facility ID: ${facility_id}`);
  }, [facility_id, token]);

  // Fetch average rating
  useEffect(() => {
    if (!facility_id || isNaN(facility_id)) {
      console.error("Invalid facility_id:", facility_id);
      toast.error("Invalid facility ID");
      return;
    }
    fetchAverageRating();
  }, [facility_id]);

  // Check rating eligibility
  useEffect(() => {
    if (!facility_id || isNaN(facility_id)) {
      console.error("Invalid facility_id:", facility_id);
      toast.error("Invalid facility ID");
      setCanRate(false);
      setEligibilityLoading(false);
      return;
    }

    const checkEligibility = async () => {
      if (!token) {
        console.log("No token found for facility_id:", facility_id);
        setCanRate(false);
        setEligibilityLoading(false);
        return;
      }

      try {
        const formData = new FormData();
        formData.append("token", token);
        formData.append("facility_id", facility_id);
        formData.append("checkEligibility", "true");

        // Log FormData contents
        for (let [key, value] of formData.entries()) {
          console.log(`Eligibility FormData for facility_id ${facility_id} - ${key}: ${value}`);
        }

        const response = await fetch(`${baseUrl}submitFacilityRating.php`, {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        console.log(`Eligibility response for facility_id ${facility_id}:`, data);
        if (data.success) {
          setCanRate(data.canRate);
        } else {
          setCanRate(false);
        }
      } catch (error) {
        console.error(`Error checking eligibility for facility_id ${facility_id}:`, error);
        setCanRate(false);
      } finally {
        setEligibilityLoading(false);
      }
    };
    checkEligibility();
  }, [facility_id, token]);

  const fetchAverageRating = async () => {
    try {
      const response = await fetch(`${baseUrl}getAverageRating.php?facility_id=${facility_id}`);
      const data = await response.json();
      if (data.success) {
        setAvgRating(data.avg_rating ? parseFloat(data.avg_rating).toFixed(1) : null);
      }
    } catch (error) {
      console.error("Error fetching rating for facility_id:", facility_id, error);
      toast.error("Failed to load rating.");
    }
  };

  const submitRating = async () => {
    console.log("Submitting rating - Token:", token, "Facility ID:", facility_id, "Rating:", userRating);
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

      // Log FormData contents
      for (let [key, value] of formData.entries()) {
        console.log(`Rating FormData for facility_id ${facility_id} - ${key}: ${value}`);
      }

      const response = await fetch(`${baseUrl}submitFacilityRating.php`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      console.log("Rating response:", data);
      if (data.success) {
        setAvgRating(data.avg_rating ? parseFloat(data.avg_rating).toFixed(1) : null);
        setUserRating(0);
        toast.success("Rating submitted successfully!");
      } else {
        const errorMessage =
          data.message === "You can only rate facilities if you have booked and stayed in a room"
            ? "You must book and stay in a room to rate this facility."
            : data.message || "Failed to submit rating.";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("An error occurred while submitting your rating.");
    } finally {
      setLoading(false);
    }
  };

  if (!facility_id || isNaN(facility_id)) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
      <img
        src={imageUrl}
        alt={facility_name}
        className="w-full h-56 object-cover rounded-t-xl"
        onError={(e) => (e.target.src = "/default-facility.jpg")}
      />
      <div className="p-6">
        <h3 className="text-xl font-serif font-semibold text-gray-800 mb-3">{facility_name}</h3>
        <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">{description}</p>
        <div className="mb-4 flex items-center">
          {avgRating !== null ? (
            <span className="text-lg text-amber-500 font-medium">⭐ {avgRating}/5</span>
          ) : (
            <span className="text-gray-500 text-sm">No ratings yet</span>
          )}
        </div>
        {eligibilityLoading ? (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : token ? (
          canRate ? (
            <>
              <div className="mb-4 flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`cursor-pointer text-2xl transition-colors duration-200 ${
                      userRating >= star ? "text-amber-500" : "text-gray-300"
                    }`}
                    onClick={() => {
                      console.log("Setting rating to:", star);
                      setUserRating(star);
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <button
                onClick={submitRating}
                disabled={loading || userRating === 0}
                className={`w-full py-2 px-4 rounded-lg font-semibold text-white transition-all duration-300 ${
                  loading || userRating === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Submitting..." : "Submit Rating"}
              </button>
            </>
          ) : (
            <p className="text-gray-600 text-sm mb-4">
              You must book and stay in a room to rate this facility.
            </p>
          )
        ) : (
          <div className="text-center">
            <p className="text-gray-600 mb-2">Log in to rate this facility</p>
            <Link
              to="/login"
              className="inline-block py-2 px-4 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300"
            >
              Log In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacilityCard;
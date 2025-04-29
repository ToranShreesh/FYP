import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { baseUrl } from "../../constants";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${baseUrl}getReviews.php`);
        const data = await response.json();
        if (data.success) {
          setReviews(data.reviews);
        } else {
          setError(data.message || "Failed to load reviews");
          toast.error(data.message || "Failed to load reviews");
        }
      } catch (err) {
        setError("Error connecting to server");
        toast.error("Error connecting to server");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const renderStars = (rating) => {
    const maxStars = 5;
    const filledStars = Math.round(rating);
    return (
      <span className="text-yellow-400">
        {[...Array(maxStars)].map((_, index) => (
          <span key={index}>{index < filledStars ? "★" : "☆"}</span>
        ))}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center">
        <svg className="animate-spin h-8 w-8 text-gray-600 mx-auto" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <p className="text-lg text-gray-600 mt-2">Loading...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-lg text-red-600">{error}</div>;
  }

  return (
    <div className="w-[1150px] mx-auto p-4 sm:p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">All Reviews</h1>
      {reviews.length === 0 ? (
        <p className="text-center text-gray-600">No reviews found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Review ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Room Class</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Reviewer</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Rating</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Description</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.review_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">{review.review_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">{review.class_name || "Unknown"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">{review.reviewer_name || "Anonymous"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">{renderStars(review.ratings)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b text-justify">{review.description || "No description"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Reviews;
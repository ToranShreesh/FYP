import React, { useState, useEffect } from 'react';
import { baseUrl } from '../../constants';

const FacilityRatings = () => {
  const [ratings, setRatings] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await fetch(baseUrl + 'getFacilityRatings.php'); // API URL for facility ratings
        const data = await response.json();
        if (data.success) {
          setRatings(data.ratings);
        } else {
          setError(data.message || 'Failed to load facility ratings');
        }
      } catch (err) {
        setError('Error connecting to server');
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, []);

  // Function to render star rating
  const renderStars = (rating) => {
    const maxStars = 5;
    const filledStars = Math.round(rating); // Assuming rating is 1–5
    return (
      <span className="text-yellow-400">
        {[...Array(maxStars)].map((_, index) => (
          <span key={index}>{index < filledStars ? '★' : '☆'}</span>
        ))}
      </span>
    );
  };

  if (loading) {
    return <div className="text-center text-lg text-gray-600">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-lg text-red-600">{error}</div>;
  }

  return (
    <div className="w-[1150px] mx-auto p-4 sm:p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Facility Ratings</h1>
      {ratings.length === 0 ? (
        <p className="text-center text-gray-600">No ratings found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Rating ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Username</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Facility Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Rating</th>
              </tr>
            </thead>
            <tbody>
              {ratings.map((rating) => (
                <tr key={rating.rating_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">{rating.rating_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">{rating.full_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">{rating.facility_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">{renderStars(rating.rating)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FacilityRatings;
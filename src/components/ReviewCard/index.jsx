import { useState } from 'react';
import toast from 'react-hot-toast';
import { baseUrl } from '../../constants';

const ReviewCard = ({ room_class_id }) => {
  const [ratings, setRatings] = useState(0);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token'); // Retrieve token from localStorage

  const validateForm = () => {
    if (!ratings || ratings < 1 || ratings > 5) {
      toast.error('Please select a rating between 1 and 5 stars.');
      return false;
    }
    if (!description.trim()) {
      toast.error('Description is required.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('token', token);
      formData.append('room_class_id', room_class_id);
      formData.append('ratings', ratings);
      formData.append('description', description);

      const response = await fetch(`${baseUrl}addReview.php`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Review submitted successfully!');
        setRatings(0);
        setDescription('');
      } else {
        toast.error(data.message || 'Failed to submit review.');
      }
    } catch (error) {
      toast.error('Something went wrong while submitting the review.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Add a Review</h3>
        <p className="text-red-600 text-lg">Please log in to submit a review.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Add a Review</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Rating</label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`text-2xl ${ratings >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                onClick={() => setRatings(star)}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Review</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            rows="4"
            placeholder="Write your review here..."
            required
          />
        </div>
        <button
          type="submit"
          className={`w-full px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300 text-xl font-semibold ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewCard;
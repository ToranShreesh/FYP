import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { baseUrl } from '../../constants';

const ReviewCard = ({ room_class_id }) => {
  const [ratings, setRatings] = useState(0);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [eligibilityLoading, setEligibilityLoading] = useState(true);

  const token = localStorage.getItem('token');

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${baseUrl}getReviews.php?room_class_id=${room_class_id}`);
        const data = await response.json();
        if (data.success && Array.isArray(data.reviews)) {
          console.log('Fetched reviews:', data.reviews);
          setReviews(data.reviews);
        } else {
          setReviewsError(true);
          toast.error(data.message || 'Failed to load reviews');
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviewsError(true);
        toast.error('Error loading reviews');
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [room_class_id]);

  // Check booking eligibility
  useEffect(() => {
    const checkEligibility = async () => {
      if (!token) {
        setCanReview(false);
        setEligibilityLoading(false);
        return;
      }

      try {
        const formData = new FormData();
        formData.append('token', token);
        formData.append('room_class_id', room_class_id);
        formData.append('checkEligibility', 'true');

        const response = await fetch(`${baseUrl}addReview.php`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (data.success) {
          setCanReview(data.canReview);
          if (!data.canReview) {
            
          }
        } else {
          toast.error(data.message || 'Failed to check review eligibility');
          setCanReview(false);
        }
      } catch (error) {
        setCanReview(false);
      } finally {
        setEligibilityLoading(false);
      }
    };
    checkEligibility();
  }, [room_class_id, token]);

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
      if (data.success && data.review) {
        toast.success('Review submitted successfully!');
        console.log('New review:', data.review);
        setRatings(0);
        setDescription('');
        setReviews((prevReviews) => [data.review, ...prevReviews]);
      } else {
        toast.error(data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Error submitting review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-2xl font-semibold text-gray-800 mb-6">Guest Reviews</h3>

      {/* Review Form (for eligible users) */}
      {eligibilityLoading ? (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : token ? (
        canReview ? (
          <div className="mb-8">
            <h4 className="text-xl font-semibold text-gray-700 mb-4">Add a Review</h4>
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
                className={`w-full px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300 text-xl font-semibold ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        ) : (
          <p className="text-red-600 text-lg mb-8">
            You must book and stay in this room to leave a review.
          </p>
        )
      ) : (
        <p className="text-red-600 text-lg mb-8">Please log in to submit a review.</p>
      )}

      {/* Reviews List */}
      <div>
        <h4 className="text-xl font-semibold text-gray-700 mb-4">
          {reviews.length > 0 ? `Reviews (${reviews.length})` : 'No Reviews Yet'}
        </h4>
        {reviewsLoading ? (
          <div className="flex justify-center credeitems-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : reviewsError ? (
          <p className="text-gray-500 text-center py-4">Failed to load reviews. Please try again later.</p>
        ) : reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No reviews available for this room yet.</p>
        ) : (
          <div className="space-y-6">
            {reviews.map((review, index) => (
              <div
                key={review.review_id || index}
                className="border-b border-gray-200 pb-4 last:border-b-0"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                      {(review.reviewer_name?.charAt(0)?.toUpperCase() || 'N/A')}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {review.reviewer_name || 'Anonymous'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {review.review_date ? new Date(review.review_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">★</span>
                    <span className="font-semibold text-gray-800">
                      {isFinite(review.ratings) ? Number(review.ratings).toFixed(1) : 'N/A'}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600">{review.description || 'No description provided'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;
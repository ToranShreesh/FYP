import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { baseUrl } from '../../constants';

const AdminHome = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    roomTypes: 0,
    totalBookings: 0,
    totalGuests: 0,
    totalEarnings: 0,
    activeBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
  });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('token', token);

      const response = await fetch(baseUrl+'dashboard.php', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch dashboard data');
      }

      setStats(result.stats);
      setBookings(result.bookings);
      // Log the raw booking_id to verify it's being fetched correctly
      result.bookings.forEach(booking => {
        console.log(`Booking ID (Formatted): ${booking.id}, Raw Booking ID: ${booking.booking_id}`);
      });
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="w-[1130px] min-h-screen p-6 bg-gray-100 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Hotel Dashboard</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
          onClick={fetchDashboardData}
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </>
          )}
        </button>
      </div>

      {loading && (
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
          <div className="bg-blue-600 h-1.5 rounded-full animate-pulse" style={{ width: '50%' }} />
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
          <p className="font-medium">Error: {error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
          <svg className="w-10 h-10 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
            <p className="text-2xl text-gray-900">{stats.totalUsers}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
          <svg className="w-10 h-10 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Total Room Types</h3>
            <p className="text-2xl text-gray-900">{stats.roomTypes}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
          <svg className="w-10 h-10 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2zm0-4H7V7h10v2z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Total Bookings</h3>
            <p className="text-2xl text-gray-900">{stats.totalBookings}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
          <svg className="w-10 h-10 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Total Guests</h3>
            <p className="text-2xl text-gray-900">{stats.totalGuests}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
          <svg className="w-10 h-10 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11 2v20c-5.05-.5-9-4.76-9-9.99C2 6.76 5.95 2.5 11 2zm2 0v20c5.05-.5 9-4.76 9-9.99C22 6.76 18.05 2.5 13 2z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Total Earnings</h3>
            <p className="text-2xl text-gray-900">Rs {stats.totalEarnings.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
          <svg className="w-10 h-10 text-green-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2zm0-4H7V7h10v2z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Active Bookings</h3>
            <p className="text-2xl text-gray-900">{stats.activeBookings}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
          <svg className="w-10 h-10 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2zm0-4H7V7h10v2z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Upcoming Bookings</h3>
            <p className="text-2xl text-gray-900">{stats.upcomingBookings}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
          <svg className="w-10 h-10 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2zm0-4H7V7h10v2z" />
          </svg>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Completed Bookings</h3>
            <p className="text-2xl text-gray-900">{stats.completedBookings}</p>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white p-4 rounded-lg shadow-md overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-700">Recent Bookings</h3>
          <a href="#" className="text-blue-500 hover:underline">View All Bookings</a>
        </div>
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">Booking ID</th>
              <th className="border px-4 py-2 text-left">User</th>
              <th className="border px-4 py-2 text-left">Booked Room Type</th>
              <th className="border px-4 py-2 text-left">Date</th>
              <th className="border px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length > 0 ? (
              bookings.map((booking, index) => (
                <tr key={index} className="border-b">
                  <td className="border px-4 py-2">
                    <a
                      href={`/bookings/${booking.booking_id}`}
                      className="text-blue-500 hover:underline"
                    >
                      {booking.id}
                    </a>
                  </td>
                  <td className="border px-4 py-2">{booking.user}</td>
                  <td className="border px-4 py-2">{booking.property}</td>
                  <td className="border px-4 py-2">{booking.date}</td>
                  <td className="border px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        booking.status === 'completed'
                          ? 'bg-red-100 text-red-800'
                          : booking.status === 'upcoming'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="border px-4 py-2 text-center text-gray-500">
                  No recent bookings available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminHome;
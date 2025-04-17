import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { baseUrl } from '../constants';

const UpdateProfile = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch current user data on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setError('Unauthorized access. Please log in.');
      return;
    }

    fetch(`${baseUrl}getUserProfile.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ token }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setFormData({
            full_name: data.user.full_name || '',
            email: data.user.email || '',
            password: '',
          });
        } else {
          setError(data.message);
        }
      })
      .catch(() => {
        setError('Failed to fetch user data. Try again later.');
      });
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Unauthorized access. Please log in.');
      setIsLoading(false);
      return;
    }

    const formBody = new URLSearchParams({
      token,
      full_name: formData.full_name,
      email: formData.email,
      password: formData.password,
    });

    try {
      const response = await fetch(`${baseUrl}updateProfile.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      if (data.success) {
        setIsSuccess(true);
        setMessage(data.message);
        setFormData({ ...formData, password: '' }); // Clear password field
      } else {
        setIsSuccess(false);
        setMessage(data.message);
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center flex-grow">
          <p className="text-red-500 text-lg font-semibold">{error}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-grow container mx-auto p-6 max-w-6xl mt-20">
        <h1 className="text-4xl font-extrabold text-gray-800 text-center">Update Profile</h1>
        <div className="mt-6 p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
          {message && (
            <div
              className={`mb-4 p-3 rounded ${
                isSuccess ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {message}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-semibold" htmlFor="full_name">
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2 font-semibold" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 font-semibold" htmlFor="password">
                Password (leave blank to keep unchanged)
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter new password"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full p-3 text-white rounded-lg ${
                isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              } transition duration-200`}
            >
              {isLoading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UpdateProfile;
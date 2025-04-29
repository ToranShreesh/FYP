import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HomeRooms from "../components/HomeRooms";
import { baseUrl } from "../constants";
import toast from "react-hot-toast";

const Home = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentReview, setCurrentReview] = useState(0);

  const reviews = [
    {
      quote: "Convenient meals around. The staff is polite and the smile is nice. Location was good. Overall it was a very satisfactory hotel.",
      author: "Guest Traveler",
      location: "from Canada",
    },
    {
      quote: "My memory of this hotel is sitting in its cool and quiet garden and being able to work on my laptop in the fresh air owing to its good Wi-Fi. The garden is full of birds, and I had an owl outside my window every morning. The staff are very attentive, especially the doormen, bellmen, and receptionists.",
      author: "George",
      location: "from UK",
    },
    {
      quote: "The ambiance was serene, and the spa services were exceptional. The staff went above and beyond to make our stay memorable. Highly recommend!",
      author: "Priya",
      location: "from India",
    },
  ];

  const services = [
    {
      icon: "☕",
      title: "Restaurant",
      description: "Savor exquisite dishes at our specialty restaurants.",
    },
    {
      icon: "🏋️",
      title: "Fitness Zone",
      description: "State-of-the-art gym with modern equipment.",
    },
    {
      icon: "🌿",
      title: "Shanti Spa",
      description: "Rejuvenate with yoga and wellness treatments.",
    },
    {
      icon: "🐾",
      title: "Pets",
      description: "Pets are not allowed.",
    },
    {
      icon: "🧼",
      title: "Laundry Service",
      description: "Convenient on-site laundry and dry-cleaning.",
    },
    {
      icon: "🏊",
      title: "Swimming Pool",
      description: "Relax in our refreshing infinity pool.",
    },
  ];

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await fetch(`${baseUrl}getRoomAndClass.php`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}, // Only include Authorization if token exists
        });
        const data = await response.json();

        if (data.success) {
          const fetchedRooms = data.room_classes || [];
          setRooms(fetchedRooms);
        } else {
          setError("Failed to load room data.");
          console.error("Error fetching rooms:", data.message);
          setRooms([]);
        }
        setLoading(false);
      } catch (err) {
        setError("An error occurred while fetching data.");
        console.error("API Error:", err);
        toast.error("Failed to load rooms. Please try again.");
        setRooms([]);
        setLoading(false);
      }
    };

    if (token) {
      fetchRooms(); // Fetch rooms only if token exists
    } else {
      setRooms([]); // Set empty rooms for unauthenticated users
      setLoading(false); // Stop loading
    }
  }, [token]);

  const handleDotClick = (index) => {
    setCurrentReview(index);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans23">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <header className="relative h-[700px]">
        <img
          className="w-full h-full object-cover"
          src="/assets/background.jpg"
          alt="Hotel Ease Exterior"
          loading="lazy"
          onError={(e) => (e.target.src = "/default-hero.jpg")}
        />
        <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4 tracking-tight drop-shadow-md">
              Welcome to Hotel Ease
            </h1>
            <p className="text-xl md:text-2xl font-light mb-8 max-w-3xl mx-auto">
              Experience unparalleled luxury and tranquility in the heart of the Himalayas.
            </p>
            <a
              href="#about"
              className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md"
              aria-label="Discover Hotel Ease"
            >
              Discover Now
            </a>
          </div>
        </div>
      </header>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-800 mb-4">
                Namaste
              </h2>
              <h3 className="text-2xl font-serif text-gray-700 mb-6">
                We bow to the divinity within you.
              </h3>
              <p className="text-gray-600 leading-relaxed mb-8">
                Nestled by the serene lakeside of Pokhara, Hotel Ease blends luxury with tranquility. Our newly renovated rooms offer modern comforts for leisure or business travelers. Relax in our lush gardens, enjoy a refreshing dip in the infinity pool, or indulge in a rejuvenating spa session at our wellness center. With yoga, meditation, and personalized services, we craft unforgettable experiences.
              </p>
              <a
                href="/about-us"
                className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md"
                aria-label="Read more about Hotel Ease"
              >
                Read More
              </a>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img
                  className="w-full h-48 object-cover rounded-xl shadow-md"
                  src="/assets/lobby1.png"
                  alt="Hotel Ease Lobby Seating Area"
                  loading="lazy"
                  onError={(e) => (e.target.src = "/default-image.jpg")}
                />
                <img
                  className="w-full h-48 object-cover rounded-xl shadow-md"
                  src="/assets/lobby2.png"
                  alt="Hotel Ease Lobby Decor"
                  loading="lazy"
                  onError={(e) => (e.target.src = "/default-image.jpg")}
                />
              </div>
              <div>
                <img
                  className="w-full h-[400px] object-cover rounded-xl shadow-md"
                  src="/assets/reception.png"
                  alt="Hotel Ease Reception"
                  loading="lazy"
                  onError={(e) => (e.target.src = "/default-image.jpg")}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rooms Section */}
      <section id="rooms" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-800 mb-4">
            Our Living Rooms
          </h2>
          <p className="text-gray-600 mb-12 text-lg">
            Discover a new dimension of luxury and comfort.
          </p>
          <HomeRooms rooms={rooms.slice(0, 3)} loading={loading} error={error} />
          <div className="mt-12">
            <a
              href="/rooms"
              className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md"
              aria-label="View All Rooms"
            >
              View All Rooms
              <svg
                className="ml-2 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-800 mb-4">
            Our Services
          </h2>
          <p className="text-gray-600 mb-12 text-lg">
            Experience gracious hospitality from our dedicated team.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-6 text-center transition-all duration-300 hover:shadow-lg"
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-serif font-semibold text-gray-800 mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/assets/reviewsection.png')" }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </div>
        <div className="relative max-w-5xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            Guest Reviews
          </h2>
          <p className="text-white mb-12 text-lg">
            Pleasing people the world over.
          </p>
          <div
            className="bg-white rounded-xl shadow-md p-8 max-w-3xl mx-auto transition-opacity duration-500"
            key={currentReview}
          >
            <p className="text-gray-600 italic mb-4 leading-relaxed">
              "{reviews[currentReview].quote}"
            </p>
            <p className="text-amber-500 font-semibold">
              {reviews[currentReview].author}
            </p>
            <p className="text-gray-600">{reviews[currentReview].location}</p>
          </div>
          <div className="flex justify-center mt-6 space-x-3">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-3 h-3 rounded-full ${
                  currentReview === index ? "bg-amber-500" : "bg-white"
                } border border-gray-300 focus:outline-none transition-colors duration-300 hover:bg-amber-400`}
                aria-label={`Go to review ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
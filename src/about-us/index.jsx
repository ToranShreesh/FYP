import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const AboutUs = () => {
  const navigate = useNavigate();
  const [showFullStory, setShowFullStory] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Back Button */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors duration-200"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back
        </button>
      </div>

      {/* Hero Section */}
      <div
        className="relative h-[700px] bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/assets/about.png')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="relative flex flex-col justify-center items-center h-full text-center text-white px-6">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 tracking-tight drop-shadow-md">
            Hotel Pokhara
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl font-light leading-relaxed drop-shadow-md">
            A sanctuary of luxury and tranquility nestled in the heart of the Himalayas.
          </p>
          <a
            href="/book"
            className="mt-8 px-8 py-3 bg-amber-500 text-white font-semibold rounded-full hover:bg-amber-600 transition-all duration-300 shadow-lg"
          >
            Book Your Stay
          </a>
        </div>
      </div>

      {/* Our Philosophy Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-800 text-center mb-6">
            Our Philosophy
          </h2>
          <div className="w-24 h-1 bg-amber-500 mx-auto mb-10"></div>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed text-center max-w-4xl mx-auto">
            At Hotel Pokhara, we craft experiences that blend unparalleled hospitality, sustainable practices, and the authentic charm of Nepal, creating a haven where every guest feels cherished.
          </p>
        </div>
      </section>

      {/* Our Journey Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <img
              src="/assets/hotelexterior.png"
              alt="Hotel Exterior"
              className="rounded-2xl shadow-xl w-full object-cover h-[450px] transition-transform duration-300 hover:scale-[1.02]"
            />
          </div>
          <div className="lg:w-1/2">
            <h3 className="text-3xl font-serif font-bold text-gray-800 mb-4">Our Journey</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              Founded in 2005, Hotel Pokhara was born from a vision to create a luxurious retreat that harmonizes with the breathtaking landscapes of Pokhara. Inspired by the serene beauty of the Himalayas and the vibrant culture of Nepal, our founders set out to redefine hospitality with a focus on elegance, sustainability, and community engagement.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Over the years, we have grown from a boutique hotel to a renowned destination, earning accolades for our innovative design, eco-friendly initiatives, and heartfelt service. Each milestone reflects our commitment to preserving the natural and cultural heritage of Pokhara while offering guests an unforgettable experience.
            </p>
            {showFullStory && (
              <div className="bg-gray-50 p-6 rounded-xl shadow-md mb-6">
                <p className="text-gray-600 leading-relaxed mb-4">
                  Our journey began with a single building overlooking Phewa Lake, designed to blend seamlessly with its surroundings. We collaborated with local artisans to craft interiors that celebrate Nepalese craftsmanship, from handwoven textiles to intricate wood carvings. As we expanded, we introduced sustainable practices, such as solar energy, rainwater harvesting, and zero-waste dining, to minimize our environmental footprint.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Today, Hotel Pokhara stands as a beacon of luxury and responsibility, supporting local communities through employment, education, and cultural preservation programs. Our story continues to evolve as we strive to create meaningful connections between our guests and the soul of Pokhara.
                </p>
              </div>
            )}
            <button
              onClick={() => setShowFullStory(!showFullStory)}
              className="text-blue-600 font-semibold flex items-center hover:text-blue-700 transition-colors"
            >
              {showFullStory ? "View Less" : "Learn More About Our Story"}
              {showFullStory ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
            </button>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-800 text-center mb-12">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Excellence",
                desc: "We strive for perfection in every detail, from our curated interiors to our personalized service.",
                image: "/assets/diamond.png",
              },
              {
                title: "Sustainability",
                desc: "Our eco-conscious practices preserve the natural beauty of Pokhara for future generations.",
                image: "/assets/leaf.png",
              },
              {
                title: "Community",
                desc: "We celebrate and support the local culture, artisans, and traditions that make Pokhara unique.",
                image: "/assets/community.png",
              },
            ].map((value, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-8 text-center shadow-md hover:shadow-lg transition-all duration-300"
              >
                <img
                  src={value.image}
                  alt={value.title}
                  className="w-24 h-24 mx-auto mb-4 rounded-lg object-contain"
                />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guest Stories Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-800 text-center mb-12">
            Guest Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote: "A breathtaking escape with impeccable service. The views and hospitality were unmatched.",
                author: "Emma Thompson",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
              },
              {
                quote: "Every moment felt curated. Hotel Pokhara is a gem in the Himalayas.",
                author: "Michael Chen",
                image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
              },
              {
                quote: "The perfect blend of luxury and authenticity. I’ll be back!",
                author: "Sofia Patel",
                image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
              },
            ].map((story, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <p className="text-gray-600 italic mb-4">"{story.quote}"</p>
                <div className="flex items-center">
                  <img
                    src={story.image}
                    alt={story.author}
                    className="w-12 h-12 rounded-full mr-4 object-cover shadow-sm"
                  />
                  <h4 className="font-semibold text-gray-800">{story.author}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore Pokhara Section */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-800 text-center mb-12">
            Explore Pokhara
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[
              {
                title: "Phewa Lake Serenity",
                desc: "Experience tranquility on Phewa Lake with a boat ride, surrounded by stunning views of the Annapurna range.",
                image: "/assets/phewa-lake.png",
              },
              {
                title: "Adventure in the Himalayas",
                desc: "Embark on trekking or paragliding adventures, with Pokhara as your gateway to the Himalayas.",
                image: "/assets/adventure.png",
              },
              {
                title: "Spiritual Retreats",
                desc: "Visit the World Peace Pagoda or Barahi Temple for a moment of reflection amidst Pokhara’s natural beauty.",
                image: "/assets/spiritual.png",
              },
            ].map((experience, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="w-full h-48">
                  <img
                    src={experience.image}
                    alt={experience.title}
                    className="w-full h-full rounded-t-xl object-cover"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{experience.title}</h3>
                  <p className="text-gray-600">{experience.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
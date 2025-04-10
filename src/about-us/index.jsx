import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const AboutUs = () => {
  return (
    <>
      <Navbar />
      {/* Hero Section */}
      <div className="relative bg-cover bg-center h-[400px]" style={{ backgroundImage: "url('./assets/about.png')" }}>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative text-center text-white flex flex-col justify-center items-center h-full">
          <h1 className="text-5xl font-bold mb-4">Discover Hotel Pokhara</h1>
          <p className="text-lg">Where luxury meets comfort in the heart of the Himalayas.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-100 py-12 mt-12">
        {/* About Us Header Section */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold uppercase">About Us</h2>
          <div className="w-16 h-1 bg-black mx-auto mt-3"></div>
          <p className="mt-4 text-gray-500">
            Welcome to Hotel Pokhara, where comfort meets luxury. We take pride in offering a serene environment, exceptional hospitality, and modern amenities to make your stay memorable.
          </p>
        </div>

        {/* Stats Section */}
        <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { icon: "hotel-icon.png", title: "100+ Rooms" },
            { icon: "customer-icon.png", title: "200+ Customers" },
            { icon: "rating-icon.png", title: "150+ Reviews" },
            { icon: "staff-icon.png", title: "200+ Staff" },
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center hover:scale-105 transition-transform">
              <img src={`./assets/${stat.icon}`} alt={stat.title} className="w-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold">{stat.title}</h3>
            </div>
          ))}
        </div>

        {/* Content Section */}
        <div className="container mx-auto flex flex-col md:flex-row items-center">
          {/* Text Section */}
          <div className="md:w-2/3 pr-6 mb-6 md:mb-0">
            <h3 className="text-2xl font-bold mb-4">Experience the Best of Hospitality</h3>
            <p className="text-gray-600">
              At Hotel Pokhara, we go above and beyond to ensure our guests have an unforgettable experience. Our rooms are designed with comfort and elegance in mind, equipped with modern amenities to cater to all your needs. Whether you are visiting for business or leisure, our dedicated team is here to provide personalized service and create lasting memories.
            </p>
          </div>

          {/* Image Section */}
          <div className="md:w-1/3">
            <img
              src="./assets/room1.png"
              alt="Luxurious Room"
              className="rounded-md shadow-md hover:shadow-lg transition-shadow"
            />
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="bg-white py-12 mt-12">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold">What Our Guests Say</h2>
            <div className="w-16 h-1 bg-black mx-auto mt-3"></div>
          </div>
          <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                text: "Amazing service and beautiful ambiance. Will visit again!",
                author: "John Doe",
              },
              {
                text: "The rooms were clean, and the view was breathtaking.",
                author: "Jane Smith",
              },
              {
                text: "Best hotel experience ever. Highly recommended!",
                author: "Robert Brown",
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-100 rounded-lg shadow p-6">
                <p className="italic text-gray-700">"{testimonial.text}"</p>
                <h4 className="mt-4 font-bold text-gray-800">- {testimonial.author}</h4>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-blue-500 py-8 text-white text-center mt-12">
          <h3 className="text-2xl font-bold">Ready to Book Your Stay?</h3>
          <p className="mt-2">Discover unparalleled luxury and comfort.</p>
          <button className="mt-4 px-6 py-3 bg-white text-blue-500 font-bold rounded-md hover:bg-gray-200">
            Book Now
          </button>
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default AboutUs;

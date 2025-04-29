import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* About Section */}
        <div>
          <h3 className="text-2xl font-semibold mb-4">Hotel Ease</h3>
          <p className="leading-relaxed text-gray-400">
            Experience the ultimate comfort and luxury in the heart of nature.
            Our hotel offers premium services and breathtaking views.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-2xl font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-3">
            <li>
              <a
                href="/rooms"
                className="text-gray-400 hover:text-gray-100 transition duration-200"
              >
                Rooms
              </a>
            </li>
            <li>
              <a
                href="/facilities"
                className="text-gray-400 hover:text-gray-100 transition duration-200"
              >
                Facilities
              </a>
            </li>
            <li>
              <a
                href="/contact"
                className="text-gray-400 hover:text-gray-100 transition duration-200"
              >
                Contact Us
              </a>
            </li>
            <li>
              <a
                href="/about-us"
                className="text-gray-400 hover:text-gray-100 transition duration-200"
              >
                About Us
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Section */}
        <div>
          <h3 className="text-2xl font-semibold mb-4">Contact Us</h3>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-center">
              <span className="mr-2">📞</span> Phone: +977-9800000000
            </li>
            <li className="flex items-center">
              <span className="mr-2">📧</span> Email: info@hotelease.com
            </li>
            <li className="flex items-center">
              <span className="mr-2">📍</span> Address: Lakeside, Pokhara, Nepal
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-gray-800 mt-8 pt-6 text-center">
        <p className="text-gray-500 text-sm">
          &copy; 2024 Hotel Ease. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

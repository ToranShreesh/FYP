import React from "react";
import Navbar from "../components/Navbar";

const ContactUs = () => {
  return (
    <>
      <Navbar />
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r bg-gray-100 to-blue-500 p-6 mt-20">
        <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Left Section */}
          <div className="w-full md:w-1/2 bg-teal-400 text-white p-8 flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-4">Let's Chat</h2>
            <p className="text-lg">
              Whether you have a question, want to start a project, or simply
              want to connect, feel free to send me a message in the contact
              form.
            </p>
          </div>

          {/* Right Section */}
          <div className="w-full md:w-1/2 p-8">
            <h2 className="text-3xl font-bold mb-6">Contact-Us</h2>
            <form className="flex flex-col space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-bold text-gray-600"
                >
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-bold text-gray-600"
                >
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-bold text-gray-600"
                >
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-bold text-gray-600"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
                ></textarea>
              </div>
              <button
                type="submit"
                className="bg-teal-400 text-white py-3 px-6 rounded-lg font-bold hover:bg-teal-500 transition"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactUs;

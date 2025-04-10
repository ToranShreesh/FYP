import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { baseUrl } from "../constants";

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState("verifying");
  const hasToasted = useRef(false); // Use a ref to track if toast has been shown

  useEffect(() => {
    const verifyPayment = async () => {
      const queryParams = new URLSearchParams(location.search);
      const pidx = queryParams.get("pidx");

      if (pidx) {
        try {
          const response = await fetch(`${baseUrl}verifyPayment.php?pidx=${pidx}`);
          const result = await response.json();

          if (result.success) {
            setPaymentStatus("success");
            if (!hasToasted.current) { // Only show toast if not already shown
              toast.success("Payment successful!");
              hasToasted.current = true;
            }
          } else {
            setPaymentStatus("error");
            if (!hasToasted.current) {
              toast.error("Payment verification failed: " + result.message);
              hasToasted.current = true;
            }
          }
        } catch (error) {
          setPaymentStatus("error");
          if (!hasToasted.current) {
            toast.error("Error verifying payment");
            hasToasted.current = true;
          }
        }
      } else {
        setPaymentStatus("error");
        if (!hasToasted.current) {
          toast.error("Invalid payment response");
          hasToasted.current = true;
        }
      }
    };

    verifyPayment();
  }, [location]);

  const handleReturn = () => {
    navigate("/home");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full mx-auto p-6 bg-white rounded-lg shadow-lg">
        {paymentStatus === "verifying" && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800">Verifying Payment...</h2>
            <p className="text-gray-600 mt-2">Please wait while we process your payment</p>
          </div>
        )}

        {paymentStatus === "success" && (
          <div className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600">Payment Completed!</h2>
            <p className="text-gray-600 mt-2">Thank you for your payment</p>
            <button
              onClick={handleReturn}
              className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
            >
              Return to Home
            </button>
          </div>
        )}

        {paymentStatus === "error" && (
          <div className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600">Payment Failed</h2>
            <p className="text-gray-600 mt-2">Something went wrong with your payment</p>
            <button
              onClick={handleReturn}
              className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
import React, { useState, useEffect } from 'react';
import { baseUrl } from '../../constants';

const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch(baseUrl+'getPayments.php'); // Adjust API URL
        const data = await response.json();
        if (data.success) {
          setPayments(data.payments);
        } else {
          setError(data.message || 'Failed to load payments');
        }
      } catch (err) {
        setError('Error connecting to server');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) {
    return <div className="text-center text-lg text-gray-600">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-lg text-red-600">{error}</div>;
  }

  return (
    <div className="w-[1160px] mx-auto p-4 sm:p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Payment List</h1>
      {payments.length === 0 ? (
        <p className="text-center text-gray-600">No payments found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Payment ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Booking ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Payment Index</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Payment Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Full Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Booking Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Check-in</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Check-out</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Booking Amount</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.payment_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">{payment.payment_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">{payment.booking_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">{payment.payment_idx}</td>
                  <td
                    className={`px-4 py-3 text-sm font-semibold border-b ${
                      payment.payment_status === 'Completed'
                        ? 'text-green-600'
                        : payment.payment_status === 'Pending'
                        ? 'text-orange-600'
                        : 'text-red-600'
                    }`}
                  >
                    {payment.payment_status}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">
                    ${Number(payment.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">
                    {new Date(payment.payment_date).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">{payment.full_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">{payment.booking_date}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">{payment.checkin_date}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">{payment.checkout_date}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 border-b">Rs{payment.booking_amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentList;
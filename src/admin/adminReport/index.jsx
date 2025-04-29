import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiDownload, FiRefreshCw, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { baseUrl } from '../../constants';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const AdminReports = () => {
  const [reportConfig, setReportConfig] = useState({
    type: 'bookings',
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),
  });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('token', token);
      formData.append('report_type', reportConfig.type);
      if (reportConfig.type === 'bookings' || reportConfig.type === 'earnings') {
        formData.append('start_date', reportConfig.startDate.toISOString().split('T')[0]);
        formData.append('end_date', reportConfig.endDate.toISOString().split('T')[0]);
      }

      const response = await fetch(`${baseUrl}reporting.php`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch report');
      }

      setReportData(result.data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportConfig]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleExportPDF = async () => {
    try {
      setLoading(true);
      const input = document.getElementById('report-content');
      const canvas = await html2canvas(input, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${reportConfig.type}_report_${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success('Report exported successfully!');
    } catch (err) {
      toast.error('Failed to export report');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    if (!reportData || reportData.length === 0) {
      return <div className="text-center py-10 text-gray-500">No data available</div>;
    }

    const dataKey = reportConfig.type === 'bookings' ? 'count' : 'amount';
    const chartTitle = reportConfig.type === 'bookings'
      ? `Bookings from ${formatDate(reportConfig.startDate)} to ${formatDate(reportConfig.endDate)}`
      : `Earnings from ${formatDate(reportConfig.startDate)} to ${formatDate(reportConfig.endDate)}`;
    const barColor = reportConfig.type === 'bookings' ? '#3B82F6' : '#10B981';

    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6">{chartTitle}</h3>
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#6b7280"
                fontSize={14}
                interval={reportData.length > 10 ? 'preserveStartEnd' : 0}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={14}
                tickFormatter={(value) =>
                  reportConfig.type === 'earnings' ? `Rs${value.toLocaleString()}` : value
                }
              />
              <Tooltip
                formatter={(value) =>
                  reportConfig.type === 'earnings' ? `Rs${value.toLocaleString()}` : value
                }
                labelFormatter={(label) => formatDate(label)}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
              />
              <Legend wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} />
              <Bar
                dataKey={dataKey}
                fill={barColor}
                name={reportConfig.type === 'bookings' ? 'Bookings' : 'Earnings'}
                barSize={reportData.length > 20 ? 20 : 40}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderGuestReport = () => {
    if (!reportData || reportData.length === 0) {
      return <div className="text-center py-10 text-gray-500">No guest data available</div>;
    }

    return (
      <div className="bg-white p-4 rounded-lg shadow-md overflow-auto">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Guest Statistics</h3>
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">Guest Name</th>
              <th className="border px-4 py-2 text-left">Email</th>
              <th className="border px-4 py-2 text-left">Booking Count</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((guest, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">{guest.full_name}</td>
                <td className="border px-4 py-2">{guest.email}</td>
                <td className="border px-4 py-2">{guest.bookingCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderRoomReport = () => {
    if (!reportData || reportData.length === 0) {
      return <div className="text-center py-10 text-gray-500">No room data available</div>;
    }

    return (
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Most Popular Rooms</h3>
        <div className="space-y-6">
          {reportData.map((room, index) => (
            <div key={index} className="border-2 border-blue-200 rounded-xl p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      #{index + 1} Most Booked
                    </span>
                    <span className="text-sm text-gray-500">
                      {room.count} bookings
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-800">{room.room_name}</h4>
                  <p className="text-gray-600 mt-1">Room Type: {room.room_class_id || 'Standard'}</p>
                </div>
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-bold text-blue-600">{room.count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const DateRangePicker = () => (
    <div className="flex mb-6 items-center gap-4">
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-600 mb-1">START DATE</label>
        <DatePicker
          selected={reportConfig.startDate}
          onChange={(date) => setReportConfig({ ...reportConfig, startDate: date })}
          selectsStart
          startDate={reportConfig.startDate}
          endDate={reportConfig.endDate}
          dateFormat="MM/dd/yyyy" // Matches the mm/dd/yyyy format in the image
          className="border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-32"
          disabled={loading}
          placeholderText="mm/dd/yyyy"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-600 mb-1">END DATE</label>
        <DatePicker
          selected={reportConfig.endDate}
          onChange={(date) => setReportConfig({ ...reportConfig, endDate: date })}
          selectsEnd
          startDate={reportConfig.startDate}
          endDate={reportConfig.endDate}
          dateFormat="MM/dd/yyyy" // Matches the mm/dd/yyyy format in the image
          className="border border-gray-300 rounded-md px-3 py-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-32"
          disabled={loading}
          placeholderText="mm/dd/yyyy"
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Custom CSS for DatePicker to highlight only hovered or selected dates */}
      <style jsx>{`
        /* Remove default range highlighting */
        .react-datepicker__day--in-range {
          background-color: transparent !important;
          color: #000 !important;
        }

        /* Ensure only the hovered date is highlighted */
        .react-datepicker__day:hover {
          background-color: #3b82f6 !important;
          color: white !important;
        }

        /* Ensure only the selected date is highlighted */
        .react-datepicker__day--selected {
          background-color: #3b82f6 !important;
          color: white !important;
        }

        /* Optional: Remove any additional range styling if present */
        .react-datepicker__day--in-selecting-range {
          background-color: transparent !important;
          color: #000 !important;
        }
      `}</style>

      <div className="w-[1130px] min-h-screen p-6 bg-gray-100 mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Hotel Reports</h2>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50"
            onClick={handleExportPDF}
            disabled={loading || !reportData || reportData.length === 0}
          >
            <FiDownload /> Export Report
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <label className="text-lg font-medium text-gray-700 whitespace-nowrap">Report Type:</label>
            <select
              className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 font-medium shadow-sm transition-all"
              value={reportConfig.type}
              onChange={(e) => setReportConfig({ ...reportConfig, type: e.target.value })}
              disabled={loading}
            >
              <option value="bookings">Bookings</option>
              <option value="earnings">Earnings</option>
              <option value="guests">Guest Statistics</option>
              <option value="most-booked-room">Most Booked Room</option>
            </select>
          </div>

          {(reportConfig.type === 'bookings' || reportConfig.type === 'earnings') && <DateRangePicker />}

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
            onClick={fetchReport}
            disabled={loading}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              <>
                <FiRefreshCw /> Refresh
              </>
            )}
          </button>
        </div>

        {loading && (
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
            <div className="bg-blue-600 h-1.5 rounded-full animate-pulse"></div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
            <p className="font-medium">Error: {error}</p>
          </div>
        )}

        <div id="report-content">
          {reportConfig.type === 'bookings' || reportConfig.type === 'earnings' ? renderChart() : 
           reportConfig.type === 'guests' ? renderGuestReport() : 
           reportConfig.type === 'most-booked-room' ? renderRoomReport() : null}
        </div>
      </div>
    </>
  );
};

export default AdminReports;
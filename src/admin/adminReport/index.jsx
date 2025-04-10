import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiDownload, FiRefreshCw } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { baseUrl } from '../../constants';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const AdminReports = () => {
  const [reportConfig, setReportConfig] = useState({
    type: 'bookings',
    range: 'daily'
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
      formData.append('time_range', reportConfig.range);

      const response = await fetch(`${baseUrl}reporting.php`, {
        method: 'POST',
        body: formData
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatMonth = (monthString) => {
    const [year, month] = monthString.split('-');
    return new Date(year, month-1).toLocaleString('default', { month: 'short' });
  };

  const handleExportPDF = async () => {
    try {
      setLoading(true);
      const input = document.getElementById('report-content');
      const canvas = await html2canvas(input, {
        scale: 2,
        logging: false,
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${reportConfig.type}_report_${new Date().toISOString().slice(0,10)}.pdf`);
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

    const isDaily = reportConfig.range === 'daily';
    const dataKey = reportConfig.type === 'bookings' ? 'count' : 'amount';
    const chartTitle = reportConfig.type === 'bookings' 
      ? `${isDaily ? 'Daily' : 'Monthly'} Bookings` 
      : `${isDaily ? 'Daily' : 'Monthly'} Earnings`;

    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">{chartTitle}</h3>
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            {isDaily ? (
              <LineChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tickFormatter={formatDate}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={formatDate}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={dataKey}
                  stroke="#3B82F6"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            ) : (
              <BarChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month"
                  tickFormatter={formatMonth}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => {
                    const [year, month] = value.split('-');
                    return new Date(year, month-1).toLocaleString('default', { 
                      month: 'long', 
                      year: 'numeric' 
                    });
                  }}
                />
                <Legend />
                <Bar
                  dataKey={dataKey}
                  fill="#3B82F6"
                />
              </BarChart>
            )}
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
              <th className="border px-4 py-2 text-left">Total Stay</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((guest, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">{guest.full_name}</td>
                <td className="border px-4 py-2">{guest.email}</td>
                <td className="border px-4 py-2">{guest.totalStay} nights</td>
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

  return (
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
          <label className="text-lg font-medium text-gray-700">Report Type:</label>
          <select
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            value={reportConfig.type}
            onChange={(e) => setReportConfig({...reportConfig, type: e.target.value})}
            disabled={loading}
          >
            <option value="bookings">Bookings</option>
            <option value="earnings">Earnings</option>
            <option value="guests">Guest Statistics</option>
            <option value="most-booked-room">Most Booked Room</option>
          </select>
        </div>

        {(reportConfig.type === 'bookings' || reportConfig.type === 'earnings') && (
          <div className="flex items-center gap-2">
            <label className="text-lg font-medium text-gray-700">Time Range:</label>
            <select
              className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={reportConfig.range}
              onChange={(e) => setReportConfig({...reportConfig, range: e.target.value})}
              disabled={loading}
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        )}

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
  );
};

export default AdminReports;
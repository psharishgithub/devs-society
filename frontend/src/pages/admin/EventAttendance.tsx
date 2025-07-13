import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, MapPin } from 'lucide-react';
import { adminApiService } from '../../services/adminApi';

interface CheckIn {
  id: string;
  checked_in_at: string;
  users: {
    full_name: string;
    email: string;
    member_id: string;
    college: string;
  };
}

interface EventInfo {
  event_id: string;
  event_title: string;
  event_date: string;
}

const EventAttendance: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<CheckIn[]>([]);
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminApiService.getEventAttendance(eventId!);
        if (res.success) {
          setAttendance(res.checkIns || []);
          setEventInfo(res.statistics || null);
        } else {
          setError(res.message || 'Failed to fetch attendance');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch attendance');
      } finally {
        setLoading(false);
      }
    };
    if (eventId) fetchAttendance();
  }, [eventId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-950 to-purple-950 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-3xl bg-white/10 rounded-2xl shadow-xl p-8 border border-cyan-500/20">
        <button
          className="flex items-center gap-2 text-cyan-300 hover:text-cyan-100 mb-6 font-semibold"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" /> Back to Events
        </button>
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Users className="h-6 w-6 text-cyan-400" /> Attendance
        </h1>
        {eventInfo && (
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:gap-8 gap-2 text-cyan-200">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> {eventInfo.event_title}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {eventInfo.event_date}
            </div>
          </div>
        )}
        {loading ? (
          <div className="text-cyan-200 text-center py-12">Loading attendance...</div>
        ) : error ? (
          <div className="text-red-400 text-center py-12">{error}</div>
        ) : attendance.length === 0 ? (
          <div className="text-gray-400 text-center py-12">No check-ins yet for this event.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white/5 rounded-xl overflow-hidden">
              <thead>
                <tr className="text-cyan-300 text-left">
                  <th className="py-2 px-4">#</th>
                  <th className="py-2 px-4">Name</th>
                  <th className="py-2 px-4">Email</th>
                  <th className="py-2 px-4">College</th>
                  <th className="py-2 px-4">Check-in Time</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((checkIn, idx) => (
                  <tr key={checkIn.id} className="border-b border-cyan-900/30 hover:bg-cyan-900/10">
                    <td className="py-2 px-4 text-cyan-100">{idx + 1}</td>
                    <td className="py-2 px-4 text-white">{checkIn.users?.full_name || '-'}</td>
                    <td className="py-2 px-4 text-cyan-100">{checkIn.users?.email || '-'}</td>
                    <td className="py-2 px-4 text-cyan-100">{checkIn.users?.college || '-'}</td>
                    <td className="py-2 px-4 text-cyan-100">{new Date(checkIn.checked_in_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventAttendance; 
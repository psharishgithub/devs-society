import React from 'react';
import { Users } from 'lucide-react';

const AttendanceOverview: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-950 to-purple-950 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-3xl bg-white/10 rounded-2xl shadow-xl p-8 border border-cyan-500/20">
        <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <Users className="h-6 w-6 text-cyan-400" /> Attendance Overview
        </h1>
        <div className="text-cyan-200 text-lg mt-8 text-center">
          This is the global attendance overview page for super admins.<br/>
          (You can enhance this page to show all event attendances, search, filter, etc.)
        </div>
      </div>
    </div>
  );
};

export default AttendanceOverview; 
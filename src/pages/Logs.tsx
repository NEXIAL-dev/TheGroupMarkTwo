// src/pages/Logs.tsx
import { useState } from 'react';
import { useAuth } from '@/stores/useAuth';
import { useAgencies } from '@/stores/useAgencies';
import { canAccessGroupLog, canAccessAgencyLog } from '@/utils/rbac';
import { BookOpen, Plus } from 'lucide-react';

export default function Logs() {
  const { user } = useAuth();
  const { agencies } = useAgencies();
  const [scope, setScope] = useState<'GROUP' | 'AGENCY'>('GROUP');
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ text: '' });

  // Mock log entries
  const mockLogs = [
    {
      id: 'l1',
      scope: 'GROUP' as const,
      text: 'New quarterly budget approved for all agencies',
      createdBy: 'u1',
      createdByName: 'Darshan Patel',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'l2',
      scope: 'AGENCY' as const,
      agencyId: 'a1',
      text: 'Successfully onboarded 3 new clients this month',
      createdBy: 'u4',
      createdByName: 'Team Lead',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
  ];

  const canCreateEntry = scope === 'GROUP' 
    ? canAccessGroupLog(user)
    : canAccessAgencyLog(user, selectedAgencyId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.text.trim()) return;
    
    // In real app, would call API to create log entry
    console.log('Creating log entry:', { scope, agencyId: selectedAgencyId, text: formData.text });
    setFormData({ text: '' });
    setShowForm(false);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Log Books</h1>
          <p className="text-gray-600">Track important activities and milestones</p>
        </div>
        {canCreateEntry && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
          >
            <Plus size={20} />
            New Entry
          </button>
        )}
      </div>

      {/* Scope Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setScope('GROUP')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
            scope === 'GROUP'
              ? 'bg-blue-100 text-blue-700 border border-blue-200'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Group Log
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScope('AGENCY')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              scope === 'AGENCY'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Agency Log
          </button>
          {scope === 'AGENCY' && (
            <select
              value={selectedAgencyId || ''}
              onChange={(e) => setSelectedAgencyId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Select Agency</option>
              {agencies.map((agency) => (
                <option key={agency.id} value={agency.id}>
                  {agency.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Create Entry Form */}
      {showForm && canCreateEntry && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Log Entry</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entry *
              </label>
              <textarea
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                rows={3}
                placeholder="Enter log entry details"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Add Entry
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Log Entries */}
      <div className="space-y-4">
        {mockLogs
          .filter(log => scope === 'GROUP' ? log.scope === 'GROUP' : log.scope === 'AGENCY' && log.agencyId === selectedAgencyId)
          .map((log) => (
            <div key={log.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <BookOpen className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 leading-relaxed mb-3">{log.text}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Logged by: {log.createdByName}</span>
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        
        {mockLogs.filter(log => scope === 'GROUP' ? log.scope === 'GROUP' : log.scope === 'AGENCY' && log.agencyId === selectedAgencyId).length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <BookOpen size={48} className="mx-auto mb-2 text-gray-300" />
            <p>No log entries found</p>
          </div>
        )}
      </div>
    </div>
  );
}
// src/pages/Notices.tsx
import { useEffect, useState } from 'react';
import { useNotices } from '@/stores/useNotices';
import { useAuth } from '@/stores/useAuth';
import { useAgencies } from '@/stores/useAgencies';
import { canPostGroupNotice, canPostAgencyNotice } from '@/utils/rbac';
import { Plus, Bell } from 'lucide-react';

export default function Notices() {
  const { notices, scope, selectedAgencyId, loadNotices, createNotice, setScope } = useNotices();
  const { agencies, loadAgencies } = useAgencies();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
  });

  useEffect(() => {
    loadAgencies();
    loadNotices('GROUP');
  }, [loadAgencies, loadNotices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.body.trim()) return;

    await createNotice({
      ...formData,
      scope,
      agencyId: scope === 'AGENCY' ? selectedAgencyId : undefined,
      createdBy: user?.id || '',
    });
    
    setFormData({ title: '', body: '' });
    setShowForm(false);
  };

  const canCreateNotice = scope === 'GROUP' 
    ? canPostGroupNotice(user)
    : canPostAgencyNotice(user, selectedAgencyId);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notices</h1>
          <p className="text-gray-600">Important announcements and updates</p>
        </div>
        {canCreateNotice && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
          >
            <Plus size={20} />
            New Notice
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
          Group Notices
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScope('AGENCY', agencies[0]?.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              scope === 'AGENCY'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Agency Notices
          </button>
          {scope === 'AGENCY' && (
            <select
              value={selectedAgencyId || ''}
              onChange={(e) => setScope('AGENCY', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {agencies.map((agency) => (
                <option key={agency.id} value={agency.id}>
                  {agency.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Create Notice Form */}
      {showForm && canCreateNotice && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Notice</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Enter notice title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                rows={4}
                placeholder="Enter notice message"
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Create Notice
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

      {/* Notices List */}
      <div className="space-y-4">
        {notices.map((notice) => (
          <div key={notice.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{notice.title}</h3>
                  <span className="text-sm text-gray-500">
                    {new Date(notice.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed mb-3">{notice.body}</p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Posted by: {notice.createdByName || 'Unknown'}</span>
                  <span>•</span>
                  <span>{notice.scope === 'GROUP' ? 'Group Notice' : 'Agency Notice'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {notices.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Bell size={48} className="mx-auto mb-2 text-gray-300" />
            <p>No notices found</p>
          </div>
        )}
      </div>
    </div>
  );
}
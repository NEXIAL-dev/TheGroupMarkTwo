import { useState, useEffect } from 'react';
import { useAuth } from '@/stores/useAuth';
import { ProfileService } from '@/services/profile';
import { Agency, AgencyWithMembers } from '@/types/models';
import { 
  User, 
  Camera, 
  Building, 
  Users, 
  Settings, 
  Plus,
  Edit3,
  Trash2,
  Upload,
  Save,
  X
} from 'lucide-react';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agency, setAgency] = useState<AgencyWithMembers | null>(null);
  const [showCreateAgency, setShowCreateAgency] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    role: user?.role || 'Core Member' as const,
    profile_pic: user?.profile_pic || '',
    background_pic: user?.background_pic || '',
    theme_pic: user?.theme_pic || '',
  });

  const [agencyForm, setAgencyForm] = useState({
    name: '',
    status: 'Open to Work' as const,
  });

  useEffect(() => {
    if (user?.agency_id) {
      loadAgency();
    }
  }, [user?.agency_id]);

  const loadAgency = async () => {
    if (!user?.agency_id) return;
    
    try {
      const agencyData = await ProfileService.getAgencyWithMembers(user.agency_id);
      setAgency(agencyData);
    } catch (error) {
      console.error('Error loading agency:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const updatedProfile = await ProfileService.updateProfile(user.id, {
        full_name: formData.full_name,
        role: formData.role,
      });
      
      setUser({ ...user, ...updatedProfile });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File, type: 'profile' | 'background' | 'theme') => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const publicUrl = await ProfileService.uploadProfileImage(user.id, file, type);
      setFormData(prev => ({
        ...prev,
        [`${type}_pic`]: publicUrl
      }));
      
      // Update user state
      const updatedUser = { ...user, [`${type}_pic`]: publicUrl };
      setUser(updatedUser);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAgency = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const newAgency = await ProfileService.createAgency(agencyForm, user.id);
      setUser({ ...user, agency_id: newAgency.id });
      setShowCreateAgency(false);
      setAgencyForm({ name: '', status: 'Open to Work' });
      await loadAgency();
    } catch (error) {
      console.error('Error creating agency:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAgencyStatus = async (status: string) => {
    if (!agency) return;
    
    try {
      await ProfileService.updateAgency(agency.id, { status: status as any });
      setAgency({ ...agency, status: status as any });
    } catch (error) {
      console.error('Error updating agency status:', error);
    }
  };

  const addRecentActivity = async (activity: string) => {
    if (!agency) return;
    
    try {
      const updatedAgency = await ProfileService.addRecentActivity(agency.id, activity);
      setAgency({ ...agency, recent_activity: updatedAgency.recent_activity });
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <User size={48} className="mx-auto mb-2 text-gray-300" />
          <p className="text-gray-500">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600">Manage your account and agency information</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
        >
          {isEditing ? <X size={20} /> : <Edit3 size={20} />}
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        {/* Background Image */}
        <div 
          className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative"
          style={{
            backgroundImage: user.background_pic ? `url(${user.background_pic})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {isEditing && (
            <label className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-lg cursor-pointer hover:bg-opacity-70 transition-colors">
              <Camera size={16} />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, 'background');
                }}
              />
            </label>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start gap-6">
            {/* Profile Picture */}
            <div className="relative">
              {user.profile_pic ? (
                <img
                  src={user.profile_pic}
                  alt={user.full_name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold border-4 border-white shadow-lg">
                  {user.full_name.charAt(0)}
                </div>
              )}
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                  <Camera size={14} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, 'profile');
                    }}
                  />
                </label>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="Core Member">Core Member</option>
                      <option value="Agency Owner">Agency Owner</option>
                    </select>
                  </div>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200 flex items-center gap-2"
                  >
                    <Save size={16} />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.full_name}</h2>
                  <p className="text-gray-600 mb-2">{user.email}</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    user.role === 'Agency Owner' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Agency Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Building className="w-5 h-5" />
            Agency Information
          </h3>
          {user.role === 'Agency Owner' && !agency && (
            <button
              onClick={() => setShowCreateAgency(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center gap-2"
            >
              <Plus size={16} />
              Create Agency
            </button>
          )}
        </div>

        {agency ? (
          <div className="space-y-6">
            {/* Agency Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">{agency.name}</h4>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-600">Status:</span>
                  {user.role === 'Agency Owner' ? (
                    <select
                      value={agency.status}
                      onChange={(e) => handleUpdateAgencyStatus(e.target.value)}
                      className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="Open to Work">Open to Work</option>
                      <option value="Busy">Busy</option>
                      <option value="Break/Vacation">Break/Vacation</option>
                      <option value="Holiday">Holiday</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      agency.status === 'Open to Work' ? 'bg-green-100 text-green-800' :
                      agency.status === 'Busy' ? 'bg-red-100 text-red-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {agency.status}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Owner: {agency.owner.full_name}
                </p>
              </div>
              
              <div>
                <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Users size={16} />
                  Members ({agency.members.length})
                </h5>
                <div className="space-y-1">
                  {agency.members.map((member) => (
                    <div key={member.id} className="text-sm text-gray-600">
                      {member.full_name}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-gray-900">Recent Activity</h5>
                {user.role === 'Agency Owner' && (
                  <button
                    onClick={() => {
                      const activity = prompt('Enter new activity:');
                      if (activity) addRecentActivity(activity);
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Add Activity
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {agency.recent_activity.length > 0 ? (
                  agency.recent_activity.slice(0, 5).map((activity, index) => (
                    <div key={index} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                      {activity}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 italic">No recent activity</div>
                )}
              </div>
            </div>
          </div>
        ) : user.role === 'Agency Owner' ? (
          <div className="text-center py-8 text-gray-500">
            <Building size={48} className="mx-auto mb-2 text-gray-300" />
            <p>You haven't created an agency yet</p>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Building size={48} className="mx-auto mb-2 text-gray-300" />
            <p>You're not associated with any agency</p>
          </div>
        )}
      </div>

      {/* Create Agency Modal */}
      {showCreateAgency && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Agency</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agency Name
                </label>
                <input
                  type="text"
                  value={agencyForm.name}
                  onChange={(e) => setAgencyForm({ ...agencyForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter agency name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Status
                </label>
                <select
                  value={agencyForm.status}
                  onChange={(e) => setAgencyForm({ ...agencyForm, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="Open to Work">Open to Work</option>
                  <option value="Busy">Busy</option>
                  <option value="Break/Vacation">Break/Vacation</option>
                  <option value="Holiday">Holiday</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateAgency}
                disabled={!agencyForm.name.trim() || isLoading}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors duration-200"
              >
                {isLoading ? 'Creating...' : 'Create Agency'}
              </button>
              <button
                onClick={() => setShowCreateAgency(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notices Section (Dummy) */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Notices</h3>
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <p className="text-sm text-blue-800">New project posted - Web development for startup</p>
            <p className="text-xs text-blue-600 mt-1">2 hours ago</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
            <p className="text-sm text-green-800">Team meeting scheduled for 5pm today</p>
            <p className="text-xs text-green-600 mt-1">4 hours ago</p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
            <p className="text-sm text-orange-800">Monthly report submission deadline approaching</p>
            <p className="text-xs text-orange-600 mt-1">1 day ago</p>
          </div>
        </div>
      </div>
    </div>
  );
}
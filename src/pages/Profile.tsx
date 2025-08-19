import { useState, useEffect } from 'react';
import { useAuth } from '@/stores/useAuth';
import { useAgencies } from '@/stores/useAgencies';
import { ProfileService } from '@/services/profile';
import { AgencyService } from '@/services/agencies';
import { Agency, AgencyWithMembers, User } from '@/types/models';
import { 
  User as UserIcon, 
  Camera, 
  Building, 
  Users, 
  Settings, 
  Plus,
  Edit3,
  Trash2,
  Upload,
  Save,
  X,
  Mail,
  Lock,
  UserPlus,
  Shield,
  Crown,
  Briefcase
} from 'lucide-react';
import RoleBadge from '@/components/ui/RoleBadge';

export default function Profile() {
  const { user, setUser } = useAuth();
  const { agencies, loadAgencies } = useAgencies();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateAgency, setShowCreateAgency] = useState(false);
  const [showCreateMember, setShowCreateMember] = useState(false);
  const [editingAgency, setEditingAgency] = useState<AgencyWithMembers | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<AgencyWithMembers | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    base_roles: user?.base_roles || ['Core Member'],
    agency_roles: user?.agency_roles || [],
    profile_pic: user?.profile_pic || '',
    background_pic: user?.background_pic || '',
    theme_pic: user?.theme_pic || '',
  });

  const [agencyForm, setAgencyForm] = useState({
    name: '',
    status: 'Open to Work' as const,
  });

  const [memberForm, setMemberForm] = useState({
    full_name: '',
    email: '',
    password: '',
    agency_roles: [] as string[],
  });

  const [editMemberForm, setEditMemberForm] = useState({
    userId: '',
    agency_roles: [] as string[],
  });

  const agencyRoleOptions = ['Owner', 'Manager', 'CFO', 'HR', 'Admin', 'Member'];

  useEffect(() => {
    loadAgencies();
  }, [loadAgencies]);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name,
        base_roles: user.base_roles || ['Core Member'],
        agency_roles: user.agency_roles || [],
        profile_pic: user.profile_pic || '',
        background_pic: user.background_pic || '',
        theme_pic: user.theme_pic || '',
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const updatedProfile = await ProfileService.updateProfile(user.id, {
        full_name: formData.full_name,
        base_roles: formData.base_roles,
        agency_roles: formData.agency_roles,
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
      await AgencyService.createAgency(agencyForm, user.id);
      setShowCreateAgency(false);
      setAgencyForm({ name: '', status: 'Open to Work' });
      await loadAgencies();
    } catch (error) {
      console.error('Error creating agency:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAgency = async (agencyId: string, updates: any) => {
    try {
      await AgencyService.updateAgency(agencyId, updates);
      await loadAgencies();
    } catch (error) {
      console.error('Error updating agency:', error);
    }
  };

  const handleDeleteAgency = async (agencyId: string) => {
    if (!confirm('Are you sure you want to delete this agency? This action cannot be undone.')) {
      return;
    }
    
    try {
      await AgencyService.deleteAgency(agencyId);
      await loadAgencies();
    } catch (error) {
      console.error('Error deleting agency:', error);
    }
  };

  const handleCreateMember = async () => {
    if (!selectedAgency) return;
    
    setIsLoading(true);
    try {
      await AgencyService.createMember(selectedAgency.id, memberForm);
      setShowCreateMember(false);
      setMemberForm({ full_name: '', email: '', password: '', agency_roles: [] });
      await loadAgencies();
    } catch (error) {
      console.error('Error creating member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMemberRoles = async () => {
    if (!editMemberForm.userId) return;
    
    try {
      await AgencyService.updateMemberRoles(editMemberForm.userId, editMemberForm.agency_roles);
      setEditMemberForm({ userId: '', agency_roles: [] });
      await loadAgencies();
    } catch (error) {
      console.error('Error updating member roles:', error);
    }
  };

  const handleRemoveMember = async (agencyId: string, userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    
    try {
      await AgencyService.removeMember(agencyId, userId);
      await loadAgencies();
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const addRecentActivity = async (agencyId: string, activity: string) => {
    try {
      await AgencyService.addRecentActivity(agencyId, activity);
      await loadAgencies();
    } catch (error) {
      console.error('Error adding activity:', error);
    }
  };

  const isCoreMember = user?.base_roles?.includes('Core Member');
  const userAgencies = agencies.filter(agency => agency.owner_id === user?.id);
  const canManageAgency = (agency: AgencyWithMembers) => {
    return agency.owner_id === user?.id || 
           (user?.agency_id === agency.id && user?.agency_roles?.includes('Manager'));
  };

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <UserIcon size={48} className="mx-auto mb-2 text-gray-300" />
          <p className="text-gray-500">Please log in to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
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
                      Base Roles
                    </label>
                    <div className="space-y-2">
                      {['Core Member', 'Agency Owner'].map((role) => (
                        <label key={role} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.base_roles.includes(role)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, base_roles: [...formData.base_roles, role] });
                              } else {
                                setFormData({ ...formData, base_roles: formData.base_roles.filter(r => r !== role) });
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm">{role}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Agency Roles
                    </label>
                    <div className="space-y-2">
                      {agencyRoleOptions.map((role) => (
                        <label key={role} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.agency_roles.includes(role)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, agency_roles: [...formData.agency_roles, role] });
                              } else {
                                setFormData({ ...formData, agency_roles: formData.agency_roles.filter(r => r !== role) });
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm">{role}</span>
                        </label>
                      ))}
                    </div>
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
                  <div className="flex flex-wrap gap-2">
                    {user.base_roles?.map((role) => (
                      <RoleBadge key={role} role={role} size="md" />
                    ))}
                    {user.agency_roles?.map((role) => (
                      <RoleBadge key={`agency-${role}`} role={role} size="md" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Agencies Section */}
      {isCoreMember && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Building className="w-5 h-5" />
              Agency Management
            </h3>
            <button
              onClick={() => setShowCreateAgency(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center gap-2"
            >
              <Plus size={16} />
              Create Agency
            </button>
          </div>

          {/* All Agencies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agencies.map((agency) => (
              <div key={agency.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">{agency.name}</h4>
                  </div>
                  {agency.owner_id === user.id && (
                    <div className="flex items-center gap-1">
                      <Crown className="w-4 h-4 text-yellow-500" />
                      <span className="text-xs text-yellow-600">Owner</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      agency.status === 'Open to Work' ? 'bg-green-100 text-green-800' :
                      agency.status === 'Busy' ? 'bg-red-100 text-red-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {agency.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Members:</span>
                    <span className="font-medium">{agency.members.length}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Owner: {agency.owner.full_name}
                  </div>
                </div>

                {canManageAgency(agency) && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingAgency(agency);
                        setSelectedAgency(agency);
                      }}
                      className="flex-1 bg-blue-100 text-blue-700 px-3 py-1.5 rounded text-sm hover:bg-blue-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit3 size={14} />
                      Edit
                    </button>
                    {agency.owner_id === user.id && (
                      <button
                        onClick={() => handleDeleteAgency(agency.id)}
                        className="bg-red-100 text-red-700 px-3 py-1.5 rounded text-sm hover:bg-red-200 transition-colors flex items-center justify-center gap-1"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {agencies.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Building size={48} className="mx-auto mb-2 text-gray-300" />
              <p>No agencies found</p>
            </div>
          )}
        </div>
      )}

      {/* Agency Details Modal */}
      {editingAgency && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">
                  Manage Agency: {editingAgency.name}
                </h3>
                <button
                  onClick={() => {
                    setEditingAgency(null);
                    setSelectedAgency(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Agency Info */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Agency Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Agency Name
                    </label>
                    <input
                      type="text"
                      value={editingAgency.name}
                      onChange={(e) => setEditingAgency({ ...editingAgency, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={editingAgency.status}
                      onChange={(e) => setEditingAgency({ ...editingAgency, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value="Open to Work">Open to Work</option>
                      <option value="Busy">Busy</option>
                      <option value="Break/Vacation">Break/Vacation</option>
                      <option value="Holiday">Holiday</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => handleUpdateAgency(editingAgency.id, {
                      name: editingAgency.name,
                      status: editingAgency.status
                    })}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update Agency Info
                  </button>
                </div>
              </div>

              {/* Members Management */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Members ({editingAgency.members.length})</h4>
                  {(editingAgency.owner_id === user.id || user?.agency_roles?.includes('Manager')) && (
                    <button
                      onClick={() => setShowCreateMember(true)}
                      className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                    >
                      <UserPlus size={14} />
                      Add Member
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {editingAgency.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <UserIcon size={16} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{member.full_name}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {member.agency_roles?.map((role) => (
                              <RoleBadge key={role} role={role} />
                            ))}
                          </div>
                        </div>
                      </div>
                      {(editingAgency.owner_id === user.id || user?.agency_roles?.includes('Manager')) && member.id !== user.id && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditMemberForm({
                                userId: member.id,
                                agency_roles: member.agency_roles || []
                              });
                            }}
                            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                          >
                            <Shield size={14} />
                            Edit Roles
                          </button>
                          <button
                            onClick={() => handleRemoveMember(editingAgency.id, member.id)}
                            className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                          >
                            <Trash2 size={14} />
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Recent Activity</h4>
                  <button
                    onClick={() => {
                      const activity = prompt('Enter new activity:');
                      if (activity) addRecentActivity(editingAgency.id, activity);
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Add Activity
                  </button>
                </div>
                <div className="space-y-2">
                  {editingAgency.recent_activity.length > 0 ? (
                    editingAgency.recent_activity.slice(0, 5).map((activity, index) => (
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
          </div>
        </div>
      )}

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

      {/* Create Member Modal */}
      {showCreateMember && selectedAgency && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Member</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={memberForm.full_name}
                  onChange={(e) => setMemberForm({ ...memberForm, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={memberForm.email}
                  onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={memberForm.password}
                  onChange={(e) => setMemberForm({ ...memberForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agency Roles
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {agencyRoleOptions.map((role) => (
                    <label key={role} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={memberForm.agency_roles.includes(role)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setMemberForm({ 
                              ...memberForm, 
                              agency_roles: [...memberForm.agency_roles, role] 
                            });
                          } else {
                            setMemberForm({ 
                              ...memberForm, 
                              agency_roles: memberForm.agency_roles.filter(r => r !== role) 
                            });
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{role}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateMember}
                disabled={!memberForm.full_name.trim() || !memberForm.email.trim() || !memberForm.password.trim() || isLoading}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200"
              >
                {isLoading ? 'Creating...' : 'Add Member'}
              </button>
              <button
                onClick={() => setShowCreateMember(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Roles Modal */}
      {editMemberForm.userId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Member Roles</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {agencyRoleOptions.map((role) => (
                <label key={role} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editMemberForm.agency_roles.includes(role)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setEditMemberForm({ 
                          ...editMemberForm, 
                          agency_roles: [...editMemberForm.agency_roles, role] 
                        });
                      } else {
                        setEditMemberForm({ 
                          ...editMemberForm, 
                          agency_roles: editMemberForm.agency_roles.filter(r => r !== role) 
                        });
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">{role}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdateMemberRoles}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Update Roles
              </button>
              <button
                onClick={() => setEditMemberForm({ userId: '', agency_roles: [] })}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
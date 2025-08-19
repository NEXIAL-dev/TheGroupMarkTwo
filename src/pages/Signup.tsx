import { useState } from 'react';
import { useAuth } from '@/stores/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { Building, Mail, Lock, User, Users, LogIn } from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    base_roles: ['Core Member'] as BaseRole[],
    agency_roles: [] as AgencyRole[],
    agency_name: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const { signUp, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    await signUp({
      email: formData.email,
      password: formData.password,
      full_name: formData.full_name,
      base_roles: formData.base_roles,
      agency_roles: formData.agency_roles,
      agency_name: formData.agency_name || undefined,
    });

    if (!error) {
      setShowSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4">
              <Building className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h1>
            <p className="text-gray-600 mb-4">
              Please check your email to verify your account before signing in.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to login page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
              <Building className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Join Business Hub</h1>
            <p className="text-gray-600">Create your account to get started</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="base_roles" className="block text-sm font-medium text-gray-700 mb-2">
                Base Roles
              </label>
              <div className="space-y-2">
                {(['Core Member', 'Agency Owner'] as BaseRole[]).map((role) => (
                  <label key={role} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.base_roles.includes(role)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ 
                            ...formData, 
                            base_roles: [...formData.base_roles, role],
                            // Auto-add Owner role if Agency Owner is selected
                            agency_roles: role === 'Agency Owner' && !formData.agency_roles.includes('Owner')
                              ? [...formData.agency_roles, 'Owner']
                              : formData.agency_roles
                          });
                        } else {
                          setFormData({ 
                            ...formData, 
                            base_roles: formData.base_roles.filter(r => r !== role),
                            // Remove Owner role if Agency Owner is deselected
                            agency_roles: role === 'Agency Owner'
                              ? formData.agency_roles.filter(r => r !== 'Owner')
                              : formData.agency_roles
                          });
                        }
                      }}
                      className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{role}</span>
                  </label>
                ))}
              </div>
            </div>

            {formData.base_roles.includes('Agency Owner') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agency Roles
                </label>
                <div className="space-y-2">
                  {(['Owner', 'Manager', 'CFO', 'HR', 'Admin'] as AgencyRole[]).map((role) => (
                    <label key={role} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.agency_roles.includes(role)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ 
                              ...formData, 
                              agency_roles: [...formData.agency_roles, role]
                            });
                          } else {
                            setFormData({ 
                              ...formData, 
                              agency_roles: formData.agency_roles.filter(r => r !== role)
                            });
                          }
                        }}
                        className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{role}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div>
              <label htmlFor="agency_name" className="block text-sm font-medium text-gray-700 mb-2">
                Agency Name {formData.base_roles.includes('Agency Owner') ? '(Recommended)' : '(Optional)'}
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="agency_name"
                  name="agency_name"
                  type="text"
                  value={formData.agency_name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
                  placeholder="Enter your agency name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
                  placeholder="Create a password"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors duration-200"
                  placeholder="Confirm your password"
                  required
                />
              </div>
              {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || formData.password !== formData.confirmPassword}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={20} />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
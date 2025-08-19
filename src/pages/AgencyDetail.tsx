// src/pages/AgencyDetail.tsx
import { useParams } from "react-router-dom";
import { useAgencies } from "@/stores/useAgencies";
import { useEffect } from "react";
import { Building, Users, Calendar } from "lucide-react";

export default function AgencyDetail() {
  const { id } = useParams<{ id: string }>();
  const { agencies, loadAgencies } = useAgencies();

  useEffect(() => {
    loadAgencies();
  }, [loadAgencies]);

  const agency = agencies.find((a) => a.id === id);

  if (!agency) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <Building size={48} className="mx-auto mb-2 text-gray-300" />
          <p className="text-gray-500">Agency not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Building className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{agency.name}</h1>
            <p className="text-gray-600">Agency Details & Management</p>
          </div>
        </div>
      </div>

      {/* Agency Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Members</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {agency.memeber_id.length}
          </p>
          <p className="text-sm text-gray-500">Active members</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Building className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Owner</h3>
          </div>
          <p className="text-sm text-gray-600">Agency Owner ID:</p>
          <p className="font-mono text-sm">{agency.owner_id}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Status</h3>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Active
          </span>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {/* <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <p className="text-sm text-gray-900">
                New client onboarding completed
              </p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div>
              <p className="text-sm text-gray-900">Monthly report submitted</p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
            <div>
              <p className="text-sm text-gray-900">Team meeting scheduled</p>
              <p className="text-xs text-gray-500">3 days ago</p>
            </div>
          </div> */}
          {agency.recent_activity.map((elem, index) => {
            return (
              <div key={index} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                <div className={`w-2 h-2 bg-orange-500 rounded-full mt-2`}></div>
                <div>
                  <p className="text-sm text-gray-900">
                    {elem}
                  </p>
                  <p className="text-xs text-gray-500">3 days ago</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

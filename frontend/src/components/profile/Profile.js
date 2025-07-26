import React from 'react';
import { Settings, User } from 'lucide-react';

const Profile = () => {
  return (
    <div className="mobile-padding">
      <div className="flex items-center mb-6">
        <h1 className="text-mobile-xl font-bold text-gray-900">Profile</h1>
      </div>
      
      <div className="card">
        <div className="text-center py-12">
          <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Settings</h3>
          <p className="text-gray-600 text-mobile">
            This page will contain user profile settings and preferences.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile; 
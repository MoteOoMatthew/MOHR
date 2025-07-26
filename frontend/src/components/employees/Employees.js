import React from 'react';
import { Users, Plus } from 'lucide-react';

const Employees = () => {
  return (
    <div className="mobile-padding">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-mobile-xl font-bold text-gray-900">Employees</h1>
        <button className="btn btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </button>
      </div>
      
      <div className="card">
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Employee Management</h3>
          <p className="text-gray-600 text-mobile">
            This page will contain the employee management interface with mobile-optimized design.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Employees; 
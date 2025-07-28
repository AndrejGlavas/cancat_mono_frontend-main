import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Footer: React.FC = () => {
  const { 
    user, 
    taxYear,
    isAdmin,
    householdStatus
    
  } = useAuth();

  console.log('Footer values:', { user, isAdmin });

  return (
    <footer className="bg-indigo-700 text-white p-4 mt-40">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">



      

          {/* Navigation */}
          <div className="space-y-1">
              <h3 className="font-semibold text-yellow-100">Beta Testing Reference</h3>
              <p>ID: {user?.id}</p>
              <p>Name: {user?.name}</p>
              Status {householdStatus}
              <p>Tax Year: {taxYear || 'Not Set'}</p>
              <p>Admin: {user?.isAdmin ? '1' : '0'}</p>
              {isAdmin && (
                <a 
                  href="/admin/households" 
                  className="inline-block mt-2 bg-yellow-500 text-black px-3 py-1 rounded hover:bg-yellow-400 transition-colors"
                >
                  ADMIN
                </a>
              )}
            </div>

          {/* Company Info */}
          <div className="text-right">
            <h3 className="font-semibold text-yellow-100 mb-2">CanCat LLC</h3>
            <p>P.O. Box 11218</p>
            <p>Elkins Park, PA 19027</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
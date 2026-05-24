import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Building2, Save, Loader2 } from 'lucide-react';
import { getBusiness, saveBusiness } from '../services/storageService';
import { getAccounts } from './AdminPage';

interface BusinessInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  userid: string;
}

export const Business: React.FC = () => {
  const { user } = useAuth();
  const [business, setBusiness] = useState<BusinessInfo>({
    name: '',
    address: '',
    phone: '',
    email: '',

    userid: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!user) return;
      try {
        const businessData = await getBusiness(user.id);
        if (businessData) {
          setBusiness({ ...businessData, userid: user.id });
        } else {
          const accounts = await getAccounts();
          const branchName = accounts.find(a => a.id === user.id)?.name || '';
          setBusiness(prev => ({ ...prev, userid: user.id, name: branchName }));
        }
      } catch (error) {
        console.error('Error fetching business:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusiness();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { name, address, phone, email, userid } = business;
      await saveBusiness({ name, address, phone, email, userid });
      window.dispatchEvent(new CustomEvent('reloadRecords'));
      alert('Business information saved successfully!');
    } catch (error: any) {
      console.error('Error saving business:', error);
      alert('Failed to save business information: ' + (error?.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: keyof Omit<BusinessInfo, 'userId'>, value: string) => {
    setBusiness(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-8 h-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Business</h2>
          <p className="text-slate-500">Manage your business information</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Business Name
            </label>
            <input
              type="text"
              value={business.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter your business name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Address
            </label>
            <textarea
              value={business.address}
              onChange={(e) => handleChange('address', e.target.value)}
              rows={3}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              placeholder="Enter your business address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={business.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={business.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSaving ? 'Saving...' : 'Save Business Info'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
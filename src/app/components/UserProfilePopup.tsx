'use client'

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { UserPreferences } from '@/types/api';

interface UserProfilePopupProps {
  isOpen: boolean;
  onClose: () => void;
  userPreferences: UserPreferences;
  setUserPreferences: (preferences: UserPreferences) => void;
}

export default function UserProfilePopup({ isOpen, onClose, userPreferences, setUserPreferences }: UserProfilePopupProps) {
  const { data: session } = useSession();
  const [email, setEmail] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const preferencesToSave = {
        ...userPreferences,
        lastUpdated: new Date().toISOString(),
        userEmail: session?.user?.email
      };
      
      //TODO: Call POST endpoint to save preferences
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferencesToSave)
      });

      // Handle response
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Preferences saved successfully:', result);
      
      setIsSaving(false);
      setIsSaved(true);
      
      setTimeout(() => {
        setIsSaved(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error saving user preferences:', error);
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('User logging out');
    } catch (error) {
      console.error('Error during logout cleanup:', error);
    }
    
    signOut({ callbackUrl: '/login' });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserPreferences({
          ...userPreferences,
          profileImage: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorChange = (value: string) => {
    // Remove # if present and ensure it's a valid hex color
    let cleanValue = value.replace('#', '').toUpperCase();
    
    // Only allow valid hex characters
    cleanValue = cleanValue.replace(/[^0-9A-F]/g, '');
    
    // Limit to 6 characters
    if (cleanValue.length > 6) {
      cleanValue = cleanValue.substring(0, 6);
    }
    
    setUserPreferences({
      ...userPreferences,
      accentColor: cleanValue
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-51 w-full max-w-3xl max-h-[80vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors duration-200"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="relative p-6 overflow-y-auto max-h-[60vh] pb-22">
              <div className="space-y-6">
                
                {/* Profile Picture */}
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden mx-auto mb-3">
                      {(userPreferences.profileImage || session?.user?.image) ? (
                        <img
                          src={userPreferences.profileImage || session?.user?.image || ''}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-black flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {userPreferences.name?.charAt(0)?.toUpperCase() || session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* <label className="absolute bottom-0 right-0 text-white p-1.5 rounded-full cursor-pointer hover:bg-gray-800 transition-colors duration-200">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label> */}
                  </div>
                  <p className="text-sm text-gray-500">Click to change profile picture</p>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={userPreferences.name || session?.user?.name || ''}
                    onChange={(e) => setUserPreferences({ ...userPreferences, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg outline-none"
                    placeholder="Enter your name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={email || session?.user?.email || ''}
                    readOnly={true}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg outline-none"
                    placeholder="Enter your email"
                  />
                </div>

                {/* Theme */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                  <select
                    value={userPreferences.theme || 'light'}
                    onChange={(e) => setUserPreferences({ ...userPreferences, theme: e.target.value as 'light' | 'dark' | 'system' })}
                    className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg outline-none"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>

                {/* Accent Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-full cursor-pointer border border-gray-300" 
                      style={{ backgroundColor: `#${userPreferences.accentColor || '000000'}` }}
                    />
                    <div className="flex-1 flex items-center">
                      <span className="text-gray-500 mr-1">#</span>
                      <input
                        type="text"
                        value={userPreferences.accentColor || '000000'}
                        maxLength={6}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 text-black rounded-lg outline-none"
                        placeholder="000000"
                        style={{ textTransform: 'uppercase' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={userPreferences.language || 'en'}
                    onChange={(e) => setUserPreferences({ ...userPreferences, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 text-black rounded-lg outline-none"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                    <option value="pt">Portuguese</option>
                    <option value="ru">Russian</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>
              </div>
              
              <div className="h-px w-full bg-gray-200 my-6"></div>
              
              <button
                onClick={handleLogout}
                className="w-full -mt-2 px-4 py-2.5 rounded-xl cursor-pointer font-medium flex items-center justify-center space-x-2 hover:bg-red-50 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="#ff0000" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-red-600">Logout</span>
              </button>
        
            </div>

            <div className="absolute bottom-6 left-6 right-10">
              <button
                onClick={handleSave}
                disabled={isSaving || isSaved}
                className={`w-full py-3 px-4 rounded-xl transition-all duration-300 font-medium flex items-center justify-center space-x-2 ${
                  isSaved 
                    ? 'bg-green-600 text-white' 
                    : isSaving 
                    ? 'bg-black text-white cursor-not-allowed' 
                    : 'bg-black text-white hover:bg-gray-800 cursor-pointer'
                }`}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : isSaved ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Saved</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

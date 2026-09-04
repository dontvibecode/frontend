"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { DEFAULT_TAB_SIZE, User, UserPreferences } from "@/types/api";
import { useTheme } from "./ThemeProvider";
import { uploadAPI } from "@/lib/api";
import ModalTemplate from "./ModalTemplate";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: "solar:sun-2-linear" },
  { value: "dark", label: "Dark", icon: "solar:moon-linear" },
  { value: "system", label: "System", icon: "solar:monitor-linear" },
] as const;

interface UserProfilePopupProps {
  isOpen: boolean;
  closePopup: () => void;
  user: User | null;
  onEditUser: (data: {
    username?: string;
    preferences?: UserPreferences;
  }) => Promise<void>;
}

export default function UserProfilePopup({
  isOpen,
  closePopup,
  user,
  onEditUser,
}: UserProfilePopupProps) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState(user?.username ?? "");
  const [accentColor, setAccentColor] = useState(
    user?.preferences?.accentColor ?? "000000"
  );
  const [language, setLanguage] = useState(user?.preferences?.language ?? "en");
  const [tabSize, setTabSize] = useState(user?.preferences?.tab_size ?? DEFAULT_TAB_SIZE);

  // Profile image upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(user?.username ?? "");
    if (user?.preferences?.theme) {
      setTheme(user.preferences.theme);
    }
    setAccentColor(user?.preferences?.accentColor ?? "000000");
    setLanguage(user?.preferences?.language ?? "en");
    setTabSize(user?.preferences?.tab_size ?? DEFAULT_TAB_SIZE);
  }, [user, setTheme]);


  console.log({ user })

  const handleSave = async () => {
    try {
      setIsSaving(true);

      await onEditUser({
        username: name,
        preferences: {
          theme,
          accentColor,
          language,
          tab_size: tabSize,
        },
      });

      setIsSaving(false);
      setIsSaved(true);

      setTimeout(() => {
        setIsSaved(false);
      }, 2000);
    } catch (error) {
      console.error("Error saving user preferences:", error);
      setIsSaving(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Please upload a JPEG, PNG, GIF, or WebP image");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Get auth token from session
      const idToken = (session as any)?.user?.idToken as string;

      if (!idToken) {
        throw new Error("Authentication required");
      }

      // Step 1: Get signed URL from backend
      const uploadUrlResponse = await uploadAPI.getProfileImageUploadUrl(
        file.type,
        idToken
      );
      if (!uploadUrlResponse) {
        throw new Error("Failed to get upload URL");
      }
      const { upload_url, public_url } = uploadUrlResponse;

      // Step 2: Upload directly to object storage
      await uploadAPI.uploadToSignedUrl(upload_url, file);

      // Step 3: Confirm upload and update user profile
      await uploadAPI.confirmProfileImageUpload(public_url, idToken);

      // Step 4: Update local state to show new image immediately
      await onEditUser({
        preferences: {
          profileImage: public_url,
        },
      });
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload image. Please try again."
      );
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleColorChange = (value: string) => {
    // Remove # if present and ensure it's a valid hex color
    let cleanValue = value.replace("#", "").toUpperCase();

    // Only allow valid hex characters
    cleanValue = cleanValue.replace(/[^0-9A-F]/g, "");

    // Limit to 6 characters
    if (cleanValue.length > 6) {
      cleanValue = cleanValue.substring(0, 6);
    }

    setAccentColor(cleanValue);
  };

  const resetFields = () => {
    console.log("Resetting fields to user data");
    setName(user?.username ?? "");
    if (user?.preferences?.theme) {
      setTheme(user.preferences.theme);
    }
    setAccentColor(user?.preferences?.accentColor ?? "000000");
    setLanguage(user?.preferences?.language ?? "en");
    setTabSize(user?.preferences?.tab_size ?? DEFAULT_TAB_SIZE);
  };

  const onClose = () => {
    console.log("Onclicked");
    resetFields();
    closePopup();
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      onClose={onClose}
      title="User Settings"
      maxWidthClassName="max-w-2xl"
      contentClassName="p-4 bg-background m-3 rounded-2xl max-h-[70vh] overflow-y-auto scrollbar-hide"
    >
      <div className="space-y-6">
                  <div className="text-center">
                    <div className="relative inline-block">
                      <div
                        className={`group w-32 h-32 bg-gray-200 rounded-full overflow-hidden mx-auto mb-3 cursor-pointer relative ${isUploading ? "opacity-70" : ""} transition-opacity`}
                        onClick={handleImageClick}
                      >
                        {!isUploading && (
                          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 bg-black/45 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <Icon icon="solar:camera-linear" className="w-6 h-6" />
                            <span className="text-xs font-medium">Change</span>
                          </div>
                        )}
                        {isUploading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                            <svg className="animate-spin w-8 h-8 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          </div>
                        )}
                        {user?.preferences?.profileImage ? (
                          <img src={user?.preferences?.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-loading flex items-center justify-center">
                            <span className="text-white font-semibold text-4xl">
                              {user?.username?.charAt(0)?.toUpperCase() ||
                                session?.user?.name?.charAt(0)?.toUpperCase() ||
                                "U"}
                            </span>
                          </div>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </div>
                    <p className="text-sm text-text-60">
                      {isUploading ? "Uploading..." : "Click to change profile picture"}
                    </p>
                    {uploadError && <p className="text-sm text-text-90 mt-1">{uploadError}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-70 mb-2">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-base-10 text-primary-text rounded-lg outline-none"
                      placeholder="Enter your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-70 mb-2">Email</label>
                    <input
                      type="email"
                      value={user?.email ?? ""}
                      readOnly={true}
                      className="w-full px-3 py-2 border border-base-10 bg-base-10 font-light text-text-70 rounded-lg outline-none"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-70 mb-2">Theme</label>
                    <div className="grid grid-cols-3 gap-1 p-1 bg-base-10 rounded-xl">
                      {THEME_OPTIONS.map((option) => {
                        const isActive = theme === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setTheme(option.value)}
                            aria-pressed={isActive}
                            className={`relative flex items-center justify-center py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                              isActive
                                ? "text-primary-text"
                                : "text-text-60 hover:text-primary-text"
                            }`}
                          >
                            {isActive && (
                              <motion.span
                                layoutId="theme-option-pill"
                                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                                className="absolute inset-0 bg-container-primary rounded-lg shadow-sm"
                              />
                            )}
                            <span className="relative flex items-center gap-2">
                              <Icon icon={option.icon} className="w-4 h-4" />
                              {option.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-primary-text mb-4">Editor Settings</h3>
                    <div>
                      <label className="block text-sm font-medium text-text-70 mb-2">Tab Size</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="1"
                          max="8"
                          value={tabSize}
                          onChange={(e) => setTabSize(Number(e.target.value))}
                          className="flex-1 h-2 bg-base-10 rounded-lg appearance-none cursor-pointer accent-primary-text"
                        />
                        <span className="w-8 text-center text-sm font-medium text-primary-text bg-base-10 px-2 py-1 rounded">
                          {tabSize}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-text-70">
                        Number of spaces for each tab in the code editor
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={isSaving || isSaved}
                    className={`hover:opacity-90 w-full py-3 px-4 rounded-full transition-all duration-300 font-medium flex items-center justify-center space-x-2 ${isSaved
                      ? "bg-primary-text text-secondary-text"
                      : isSaving
                        ? "bg-primary-text text-secondary-text cursor-not-allowed"
                        : "bg-primary-text text-secondary-text cursor-pointer"
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
    </ModalTemplate>
  );
}

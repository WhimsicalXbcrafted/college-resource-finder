"use client"

import { useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { Camera, Bell, Lock, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

/**
 * Allows users to update their profile settings.
 * Users can change their name, email, password, and notification preferences.
 * It also allows uploading a new profile picture.
 * 
 * @returns {JSX.Element} The settings page layout with forms for updating user information.
 */
export default function SettingsPage() {
  // Use the session data from NextAuth to get the current user session
  const { data: session, update } = useSession()
  const router = useRouter()

  // State hooks to store form values
  const [name, setName] = useState(session?.user?.name || "")
  const [email, setEmail] = useState(session?.user?.email || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Ref for file input element to handle profile picture upload
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Class name for input fields
  const inputClassName = "w-full p-3 border rounded-md focus:ring-2 focus:ring-primary text-foreground bg-background"

  /**
   * Handles form submission to update the user's settings.
   * Validates passwords if changing, and sends a PUT request to update the settings.
   * 
   * @param {React.FormEvent} e The form submission event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    // Validate passwords if changing
    if (newPassword && !currentPassword) {
      setError("Please enter your current password")
      setIsLoading(false)
      return
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      // Send a PUT request to update the user's settings
      const response = await fetch('/api/settings/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
          emailNotifications,
          pushNotifications,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update settings')
      }

      // Update session with new user data if the update was successful
      if (data.user) {
        await update({
          ...session,
          user: {
            ...session?.user,
            name: data.user.name,
            email: data.user.email,
          }
        })
      }

      setSuccess(data.message || "Settings updated successfully!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      setError(err.message || "Failed to update settings. Please try again.")
      console.error("Settings update error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handles image upload when the user selects a new profile picture.
   * Sends the selected image to the backend API for processing.
   * 
   * @param {React.ChangeEvent<HTMLInputElement>} e The change event for the file input
   */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('image', file)

    try {
      setIsLoading(true)
      setError("")
      const response = await fetch('/api/settings/upload-image', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image')
      }

      // Update the user's session with the new profile image
      await update({ ...session, user: { ...session?.user, image: data.imageUrl } })
      console.log(data.imageUrl);
      setSuccess("Profile picture updated successfully!")
    } catch (err: any) {
      setError(err.message || "Failed to upload image. Please try again.")
      console.error("Upload error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page transition animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header with back button and title */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.push('/main')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}

        {/* Profile picture section */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Camera size={40} />
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-primary text-primary p-2 rounded-full hover:bg-primary/90"
            >
              <Camera size={20} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        {/* Settings form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name input */}
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClassName}
            />
          </div>

          {/* Email input */}
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClassName}
            />
          </div>

          {/* Password change section */}
          <div className="pt-6 border-t">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Lock className="mr-2" /> Change Password
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputClassName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClassName}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClassName}
                />
              </div>
            </div>
          </div>

          {/* Notification settings */}
          <div className="pt-6 border-t">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Bell className="mr-2" /> Notifications
            </h2>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="ml-2">Email Notifications</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={pushNotifications}
                  onChange={(e) => setPushNotifications(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="ml-2">Push Notifications</span>
              </label>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white py-3 rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

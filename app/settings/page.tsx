"use client" 

import { useState, useRef } from "react"
import { useSession } from "next-auth/react" 
import { motion } from "framer-motion" 
import { Camera, Bell, Lock, ArrowLeft } from "lucide-react" 
import { useRouter } from "next/navigation" 
import Image from "next/image" 
import defaultAvatar from "../../public/uploads/default.png" 

const SettingsPage = () => {
  // Access user session data and update function
  const { data: session, update } = useSession()
  const router = useRouter() // Router for navigation

  // State for form inputs and UI feedback
  const [name, setName] = useState(session?.user?.name || "") // User's name
  const [email, setEmail] = useState(session?.user?.email || "") // User's email
  const [currentPassword, setCurrentPassword] = useState("") // Current password input
  const [newPassword, setNewPassword] = useState("") // New password input
  const [confirmPassword, setConfirmPassword] = useState("") // Confirm new password input
  const [emailNotifications, setEmailNotifications] = useState(true) // Email notifications toggle
  const [pushNotifications, setPushNotifications] = useState(true) // Push notifications toggle
  const [error, setError] = useState("") // Error message
  const [success, setSuccess] = useState("") // Success message
  const [isLoading, setIsLoading] = useState(false) // Loading state

  // Ref for file input to trigger image upload
  const fileInputRef = useRef<HTMLInputElement>(null)

  // CSS class for input fields
  const inputClassName =
    "w-full p-3 border rounded-md focus:ring-2 focus:ring-primary text-foreground bg-background"

  // Handle form submission for updating settings
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // Prevent default form behavior
    setIsLoading(true) // Set loading state
    setError("") // Clear previous errors
    setSuccess("") // Clear previous success messages

    // Validate password inputs
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
      // Send PUT request to update settings
      const response = await fetch("/api/settings/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          currentPassword: currentPassword || undefined, // Only send if provided
          newPassword: newPassword || undefined, // Only send if provided
          emailNotifications,
          pushNotifications,
        }),
      })

      const data = await response.json()

      // Handle errors from the API
      if (!response.ok) {
        throw new Error(data.error || "Failed to update settings")
      }

      // Update session if user data is returned
      if (data.user) {
        await update({
          ...session,
          user: {
            ...session?.user,
            name: data.user.name,
            email: data.user.email,
          },
        })
      }

      // Show success message and reset password fields
      setSuccess(data.message || "Settings updated successfully!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: unknown) {
      // Handle errors and display appropriate message
      if (error instanceof Error) {
        setError(error.message || "Failed to update settings. Please try again.")
      } else {
        setError("Failed to update settings. Please try again.")
      }
      console.error("Settings update error:", error)
    } finally {
      setIsLoading(false) // Reset loading state
    }
  }

  // Handle profile picture upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] // Get the selected file
    if (!file) return

    const formData = new FormData() // Create FormData object
    formData.append("image", file) // Append the file to FormData

    try {
      setIsLoading(true) // Set loading state
      setError("") // Clear previous errors

      // Send POST request to upload image
      const response = await fetch("/api/settings/upload-image", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      // Handle errors from the API
      if (!response.ok) {
        throw new Error(data.error || "Failed to upload image")
      }

      // Update session with new image URL
      await update({ ...session, user: { ...session?.user, image: data.imageUrl } })
      setSuccess("Profile picture updated successfully!") // Show success message
    } catch (error: unknown) {
      // Handle errors and display appropriate message
      if (error instanceof Error) {
        setError(error.message || "Failed to upload image. Please try again.")
      } else {
        setError("Failed to upload image. Please try again.")
      }
      console.error("Upload error:", error)
    } finally {
      setIsLoading(false) // Reset loading state
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Animated container for settings page */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} // Initial animation state
        animate={{ opacity: 1, y: 0 }} // Animate to visible state
        className="max-w-2xl mx-auto"
      >
        {/* Back button and page title */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.push("/main")} // Navigate back to main page
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-6 w-6" /> {/* Back arrow icon */}
          </button>
          <h1 className="text-3xl font-bold">Settings</h1> {/* Page title */}
        </div>

        {/* Display error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Display success message */}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
            {success}
          </div>
        )}

        {/* Profile picture section */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            {/* Profile picture container */}
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200">
              {session?.user?.image ? ( // Display user's profile picture if available
                <Image
                  src={session.user.image}
                  alt="Profile"
                  width={128}
                  height={128}
                  className="object-cover"
                />
              ) : ( // Display default avatar if no profile picture
                <Image
                  src={defaultAvatar}
                  alt="Default Avatar"
                  width={128}
                  height={128}
                  className="object-cover"
                />
              )}
            </div>
            {/* Button to trigger file input for image upload */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-primary text-primary p-2 rounded-full hover:bg-primary/90"
            >
              <Camera size={20} /> {/* Camera icon */}
            </button>
            {/* Hidden file input for image upload */}
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
          {/* Name input field */}
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClassName}
            />
          </div>

          {/* Email input field */}
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClassName}
            />
          </div>

          {/* Change password section */}
          <div className="pt-6 border-t">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Lock className="mr-2" /> Change Password
            </h2>
            <div className="space-y-4">
              {/* Current password input */}
              <div>
                <label className="block text-sm font-medium mb-2">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={inputClassName}
                />
              </div>
              {/* New password input */}
              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClassName}
                />
              </div>
              {/* Confirm new password input */}
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

          {/* Notifications section */}
          <div className="pt-6 border-t">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Bell className="mr-2" /> Notifications
            </h2>
            <div className="space-y-4">
              {/* Email notifications toggle */}
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="ml-2">Email Notifications</span>
              </label>
              {/* Push notifications toggle */}
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

          {/* Save changes button */}
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
  )
}

export default SettingsPage
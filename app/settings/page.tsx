'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { isUWEmail } from '../utils/emailValidator'

export default function SettingsPage() {
  const router = useRouter()
  const { data: session } = useSession()

  // Profile Information state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('/default-avatar.png')
  const [emailError, setEmailError] = useState('')
  const [updateError, setUpdateError] = useState('')

  // Notification Preferences state
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)

  // Password state 
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('') 
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    if (session?.user) {
      // Default name is set to the email (per requirement)
      setName(session.user.email || '')
      setEmail(session.user.email || '')
    }
  }, [session])

  // Handle for saving profile updates
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdateError('')
    if (!isUWEmail(email)) {
      setEmailError("Please use a valid @uw.edu email address")
      return
    }
    setEmailError('')

    try {
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          emailNotifications,
          pushNotifications,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setUpdateError(data.error || "Failed to save changes")
        return
      }

      alert('Changes saved successfully!')
    } catch (error) {
      console.error('Error saving changes:', error)
      setUpdateError("Error saving changes")
    }
  } 

  // Handle password update
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    try {
      const response = await fetch('/api/user/updatePassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          email,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setPasswordError(data.error || "Failed to update password")
        return
      }

      alert('Password updated successfully!')
    } catch (error) {
      console.error('Error updating password:', error)
      setPasswordError("Error updating password")
    }
  }

  // Handle profile picture change remains the same
  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const formData = new FormData()
      formData.append('profilePicture', file)
      formData.append('email', email) // send email along with file

      try {
        const response = await fetch('/api/user/updateProfilePicture', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const data = await response.json()
          setUpdateError(data.error || "Failed to update profile picture")
          return
        }

        const data = await response.json()
        setAvatarUrl(data.avatarUrl)
        alert('Profile picture updated successfully!')
      } catch (error) {
        console.error('Error uploading profile picture:', error)
        setUpdateError("Error uploading profile picture")
      }
    }
  }

  const handleBack = () => {
    router.push('/main')
  }

  return (
    <div className="container mx-auto p-4 space-y-6 bg-background text-foreground">
      {/* Page Title */}
      <motion.h1
        className="text-4xl font-bold text-primary mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Account Settings
      </motion.h1>

      {/* Profile Information Section */}
      <motion.div
        className="border border-border rounded shadow-md p-4 bg-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-2xl font-semibold mb-2 text-primary">Profile Information</h2>
        <p className="text-sm text-muted-foreground mb-4">Update your personal information</p>
        <form onSubmit={handleSave} className="space-y-4">
          {/* Avatar and Change Picture Button */}
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-muted">
              <img src={avatarUrl || "/placeholder.svg"} alt={name} className="w-full h-full object-cover" />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="hidden"
              id="profile-picture-input"
            />
            <label
              htmlFor="profile-picture-input"
              className="border border-input px-4 py-2 rounded text-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
            >
              Change Picture
            </label>
          </div>
          {/* Name Field */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-foreground">
              Name
            </label>
            <input
              id="name"
              type="text"
              className="border border-input rounded p-2 w-full bg-background text-primary"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="border border-input rounded p-2 w-full bg-background text-primary"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setEmailError("")
              }}
              placeholder="yourname@uw.edu"
            />
            {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
          </div>
          {updateError && <p className="text-red-500 text-sm">{updateError}</p>}
        </form>
      </motion.div>

      {/* Account Security Section */}
      <motion.div
        className="border border-border rounded shadow-md p-4 bg-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <h2 className="text-2xl font-semibold mb-2 text-primary">Account Security</h2>
        <p className="text-sm text-muted-foreground mb-4">Manage your account security</p>
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <label htmlFor="current-password" className="block text-sm font-medium text-foreground">
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              className="border border-input rounded p-2 w-full bg-background text-primary"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          {/* New Password */}
          <div className="space-y-2">
            <label htmlFor="new-password" className="block text-sm font-medium text-foreground">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              className="border border-input rounded p-2 w-full bg-background text-primary"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          {/* Confirm New Password */}
          <div className="space-y-2">
            <label htmlFor="confirm-password" className="block text-sm font-medium text-foreground">
              Confirm New Password
            </label>
            <input
              id="confirm-password"
              type="password"
              className="border border-input rounded p-2 w-full bg-background text-primary"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
          </div>
        </form>
      </motion.div>

      {/* Notification Preferences Section */}
      <motion.div
        className="border border-border rounded shadow-md p-4 bg-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h2 className="text-2xl font-semibold mb-2 text-primary">Notification Preferences</h2>
        <p className="text-sm text-muted-foreground mb-4">Manage how you receive notifications</p>
        <form onSubmit={handleSave} className="space-y-4">
          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="email-notifications" className="block text-sm font-medium text-foreground">
                Email Notifications
              </label>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <input
              id="email-notifications"
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="w-5 h-5 text-primary bg-background border-input rounded focus:ring-primary"
            />
          </div>
          {/* Push Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <label htmlFor="push-notifications" className="block text-sm font-medium text-foreground">
                Push Notifications
              </label>
              <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
            </div>
            <input
              id="push-notifications"
              type="checkbox"
              checked={pushNotifications}
              onChange={(e) => setPushNotifications(e.target.checked)}
              className="w-5 h-5 text-primary bg-background border-input rounded focus:ring-primary"
            />
          </div>
        </form>
      </motion.div>

      {/* Back and Save Changes Buttons */}
      <motion.div
        className="flex justify-end items-center space-x-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center bg-secondary text-secondary-foreground px-4 py-2 rounded hover:bg-secondary/90 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        <button
          type="submit"
          onClick={handleSave}
          className="flex items-center bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </button>
      </motion.div>
    </div>
  )
}
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

  // Notification Preferences state
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)

  useEffect(() => {
    if (session?.user) {
      setName(session.user.email?.split("@")[0] || "")
      setEmail(session.user.email || '')
    }
  }, [session])

  // Handle for submission (for saving setting)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isUWEmail(email)) {
      setEmailError("Please use a valid @uw.edu email address")
      return
    }
    setEmailError('')

    // TODO: Implement API call to save changes
    console.log("Saving changes")

    // Simulating API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    alert('Changes saved successfully!')
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
            <button
              type="button"
              className="border border-input px-4 py-2 rounded text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Change Picture
            </button>
          </div>
          {/* Name Field */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-foreground">
              Name
            </label>
            <input
              id="name"
              type="text"
              className="border border-input rounded p-2 w-full bg-background text-foreground dark:text-white"
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
              className="border border-input rounded p-2 w-full bg-background text-foreground dark:text-white"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setEmailError("")
              }}
            />
            {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
          </div>
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
        <form onSubmit={handleSave} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <label htmlFor="current-password" className="block text-sm font-medium text-foreground">
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              className="border border-input rounded p-2 w-full bg-background text-foreground dark:text-white"
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
              className="border border-input rounded p-2 w-full bg-background text-foreground dark:text-white"
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
              className="border border-input rounded p-2 w-full bg-background text-foreground dark:text-white"
            />
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

      {/* Save Changes and Back Buttons */}
      <motion.div
        className="flex justify-between items-center"
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
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { User, Mail, Phone, MapPin, Edit2, Save, X, Lock, Key } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../utils/api'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      location: user?.location || ''
    }
  })

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors: passwordErrors } } = useForm()

  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      const response = await authApi.updateProfile(data)
      updateUser(response.data.user)
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      const message = error.response?.data?.message || 'Failed to update profile'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const onPasswordSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    try {
      setChangingPassword(true)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Password changed successfully!')
        setShowChangePassword(false)
        resetPassword()
      } else {
        toast.error(result.message || 'Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }
  const handleCancel = () => {
    reset({
      name: user?.name || '',
      phone: user?.phone || '',
      location: user?.location || ''
    })
    setIsEditing(false)
  }

  const handleCancelPassword = () => {
    setShowChangePassword(false)
    resetPassword()
  }
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            My Profile
          </h1>
          <p className="text-lg text-gray-600">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-primary-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{user.name}</h2>
              <p className="text-gray-600 mb-4">{user.email}</p>
              <div className="text-sm text-gray-500">
                <p>Member since {new Date(user.createdAt).toLocaleDateString()}</p>
                {user.lastActive && (
                  <p>Last active {new Date(user.lastActive).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2">
            {!showChangePassword ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Profile Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-outline"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCancel}
                      className="btn-secondary"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit(onSubmit)}
                      disabled={isLoading}
                      className="btn-primary"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="form-label">
                    <User className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      {...register('name', {
                        required: 'Name is required',
                        minLength: {
                          value: 2,
                          message: 'Name must be at least 2 characters'
                        },
                        maxLength: {
                          value: 50,
                          message: 'Name cannot exceed 50 characters'
                        }
                      })}
                      className="form-input"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                      {user.name}
                    </div>
                  )}
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                    {user.email}
                    <span className="text-sm text-gray-500 ml-2">(Cannot be changed)</span>
                  </div>
                </div>

                <div>
                  <label className="form-label">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      {...register('phone', {
                        pattern: {
                          value: /^\+?[\d\s-()]+$/,
                          message: 'Please enter a valid phone number'
                        }
                      })}
                      className="form-input"
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                      {user.phone || 'Not provided'}
                    </div>
                  )}
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      {...register('location')}
                      className="form-input"
                      placeholder="City, State"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-900">
                      {user.location || 'Not provided'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="form-label">Account Status</label>
                  <div className="flex items-center space-x-4">
                    <span className={`badge ${user.isVerified ? 'badge-active' : 'bg-yellow-100 text-yellow-800'}`}>
                      {user.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                    {!user.isVerified && (
                      <button
                        type="button"
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Verify Account
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Change Password</h3>
                  <button
                    onClick={handleCancelPassword}
                    className="btn-secondary"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>

                <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6">
                  <div>
                    <label className="form-label">
                      <Lock className="w-4 h-4 inline mr-2" />
                      Current Password
                    </label>
                    <input
                      type="password"
                      {...registerPassword('currentPassword', {
                        required: 'Current password is required'
                      })}
                      className="form-input"
                      placeholder="Enter your current password"
                    />
                    {passwordErrors.currentPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">
                      <Key className="w-4 h-4 inline mr-2" />
                      New Password
                    </label>
                    <input
                      type="password"
                      {...registerPassword('newPassword', {
                        required: 'New password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters'
                        }
                      })}
                      className="form-input"
                      placeholder="Enter your new password"
                    />
                    {passwordErrors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="form-label">
                      <Key className="w-4 h-4 inline mr-2" />
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      {...registerPassword('confirmPassword', {
                        required: 'Please confirm your new password'
                      })}
                      className="form-input"
                      placeholder="Confirm your new password"
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="btn-primary w-full"
                  >
                    {changingPassword ? 'Changing Password...' : 'Change Password'}
                  </button>
                </form>
              </div>
            )}

            {/* Account Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Account Actions</h3>
              <div className="space-y-4">
                <button 
                  onClick={() => setShowChangePassword(!showChangePassword)}
                  className="btn-outline w-full justify-start"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

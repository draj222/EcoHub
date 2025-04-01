'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/app/components/Header';
import { FiCalendar, FiMapPin, FiUsers } from 'react-icons/fi';

const CATEGORIES = [
  "Cleanup",
  "Conservation",
  "Education",
  "Advocacy",
  "Research"
];

export default function CreateOpportunityPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('Cleanup');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [skillsRequired, setSkillsRequired] = useState('');
  
  // Form validation
  const [formErrors, setFormErrors] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
  });
  
  // Redirect if not logged in
  if (status === 'unauthenticated') {
    router.push('/signin?callbackUrl=/community/create');
    return null;
  }
  
  const validateForm = () => {
    const errors = {
      title: '',
      description: '',
      location: '',
      startDate: '',
    };
    
    let isValid = true;
    
    if (!title.trim()) {
      errors.title = 'Title is required';
      isValid = false;
    }
    
    if (!description.trim()) {
      errors.description = 'Description is required';
      isValid = false;
    }
    
    if (!location.trim()) {
      errors.location = 'Location is required';
      isValid = false;
    }
    
    if (!startDate) {
      errors.startDate = 'Start date is required';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const formData = {
        title,
        description,
        location,
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : null,
        category,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
        skillsRequired: skillsRequired || null,
      };
      
      const response = await fetch('/api/community/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create opportunity');
      }
      
      // Success! Redirect to the opportunities list
      router.push('/community');
      router.refresh();
      
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Create Volunteer Opportunity</h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
            {/* Title */}
            <div className="mb-4">
              <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                Title*
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  formErrors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Beach Cleanup Day"
              />
              {formErrors.title && (
                <p className="mt-1 text-red-500 text-sm">{formErrors.title}</p>
              )}
            </div>
            
            {/* Description */}
            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                Description*
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  formErrors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Provide details about the volunteer opportunity..."
              ></textarea>
              {formErrors.description && (
                <p className="mt-1 text-red-500 text-sm">{formErrors.description}</p>
              )}
            </div>
            
            {/* Location */}
            <div className="mb-4">
              <label htmlFor="location" className="block text-gray-700 font-medium mb-2">
                <FiMapPin className="inline mr-1" />
                Location*
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  formErrors.location ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="123 Green Street, Cityville"
              />
              {formErrors.location && (
                <p className="mt-1 text-red-500 text-sm">{formErrors.location}</p>
              )}
            </div>
            
            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="startDate" className="block text-gray-700 font-medium mb-2">
                  <FiCalendar className="inline mr-1" />
                  Start Date & Time*
                </label>
                <input
                  type="datetime-local"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    formErrors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.startDate && (
                  <p className="mt-1 text-red-500 text-sm">{formErrors.startDate}</p>
                )}
              </div>
              <div>
                <label htmlFor="endDate" className="block text-gray-700 font-medium mb-2">
                  <FiCalendar className="inline mr-1" />
                  End Date & Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            
            {/* Category */}
            <div className="mb-4">
              <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Max Participants */}
            <div className="mb-4">
              <label htmlFor="maxParticipants" className="block text-gray-700 font-medium mb-2">
                <FiUsers className="inline mr-1" />
                Maximum Participants (Optional)
              </label>
              <input
                type="number"
                id="maxParticipants"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                min="1"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 20"
              />
            </div>
            
            {/* Skills Required */}
            <div className="mb-6">
              <label htmlFor="skillsRequired" className="block text-gray-700 font-medium mb-2">
                Skills Required (Optional)
              </label>
              <input
                type="text"
                id="skillsRequired"
                value={skillsRequired}
                onChange={(e) => setSkillsRequired(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., First aid, gardening knowledge"
              />
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Creating...' : 'Create Opportunity'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
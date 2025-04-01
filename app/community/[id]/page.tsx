'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Link from 'next/link';
import Image from 'next/image';
import { format, isPast } from 'date-fns';
import { 
  FiMapPin, 
  FiCalendar, 
  FiUsers, 
  FiClock,
  FiArrowLeft,
  FiCheck,
  FiUserPlus
} from 'react-icons/fi';
import { getImageUrl } from '../../utils/imageUtils';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate?: string;
  category: string;
  skillsRequired?: string;
  maxParticipants?: number;
  imageUrl?: string;
  organizer: {
    id: string;
    name: string;
    image: string | null;
  };
  _count: {
    participants: number;
    comments: number;
  };
}

interface ParticipantStatus {
  isParticipating: boolean;
  status: string;
}

export default function OpportunityDetailPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [participantStatus, setParticipantStatus] = useState<ParticipantStatus>({
    isParticipating: false,
    status: ''
  });
  const [isSigningUp, setIsSigningUp] = useState(false);
  
  useEffect(() => {
    fetchOpportunityDetails();
    if (session?.user?.id) {
      checkParticipationStatus();
    }
  }, [params.id, session?.user?.id]);
  
  const fetchOpportunityDetails = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/community/opportunities/${params.id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Opportunity not found");
        }
        throw new Error("Failed to fetch opportunity details");
      }
      
      const data = await response.json();
      setOpportunity(data.opportunity);
    } catch (err: any) {
      console.error("Error fetching opportunity details:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkParticipationStatus = async () => {
    try {
      const response = await fetch(`/api/community/opportunities/${params.id}/participation?userId=${session?.user?.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setParticipantStatus({
          isParticipating: data.isParticipating,
          status: data.status || ''
        });
      }
    } catch (err) {
      console.error("Error checking participation status:", err);
    }
  };
  
  const handleSignUp = async () => {
    if (!session) {
      router.push(`/signin?callbackUrl=/community/${params.id}`);
      return;
    }
    
    try {
      setIsSigningUp(true);
      
      const response = await fetch(`/api/community/opportunities/${params.id}/participate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to sign up");
      }
      
      // Update local state to reflect participation
      setParticipantStatus({
        isParticipating: true,
        status: 'registered'
      });
      
      // Refresh opportunity details to update participant count
      fetchOpportunityDetails();
      
    } catch (err: any) {
      console.error("Error signing up:", err);
      alert(err.message || "Failed to sign up. Please try again.");
    } finally {
      setIsSigningUp(false);
    }
  };
  
  const handleCancelParticipation = async () => {
    if (!session) return;
    
    try {
      setIsSigningUp(true);
      
      const response = await fetch(`/api/community/opportunities/${params.id}/participate`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: session.user.id
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to cancel participation");
      }
      
      // Update local state
      setParticipantStatus({
        isParticipating: false,
        status: ''
      });
      
      // Refresh opportunity details
      fetchOpportunityDetails();
      
    } catch (err: any) {
      console.error("Error canceling participation:", err);
      alert(err.message || "Failed to cancel. Please try again.");
    } finally {
      setIsSigningUp(false);
    }
  };
  
  const isEventPast = opportunity ? isPast(new Date(opportunity.startDate)) : false;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="h-48 bg-gray-200 rounded w-full mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <Link href="/community" className="inline-flex items-center text-green-600 hover:text-green-800">
              <FiArrowLeft className="mr-2" />
              Back to Opportunities
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  if (!opportunity) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Opportunity Not Found</h2>
            <p className="text-gray-700 mb-6">The volunteer opportunity you're looking for doesn't exist or has been removed.</p>
            <Link href="/community" className="inline-flex items-center text-green-600 hover:text-green-800">
              <FiArrowLeft className="mr-2" />
              Back to Opportunities
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Navigation */}
          <Link href="/community" className="inline-flex items-center text-green-600 hover:text-green-800 mb-6">
            <FiArrowLeft className="mr-2" />
            Back to Opportunities
          </Link>
          
          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Hero Banner */}
            {opportunity.imageUrl ? (
              <div className="relative h-64 w-full">
                <Image
                  src={getImageUrl(opportunity.imageUrl)}
                  alt={opportunity.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                <div className="absolute bottom-0 left-0 p-6">
                  <div className="inline-block bg-green-600 text-white text-sm px-3 py-1 rounded-full mb-3">
                    {opportunity.category}
                  </div>
                  <h1 className="text-3xl font-bold text-white mb-2">{opportunity.title}</h1>
                </div>
              </div>
            ) : (
              <div className="relative h-64 w-full bg-gradient-to-r from-green-500 to-green-600 flex items-end">
                <div className="p-6">
                  <div className="inline-block bg-white text-green-600 text-sm px-3 py-1 rounded-full mb-3">
                    {opportunity.category}
                  </div>
                  <h1 className="text-3xl font-bold text-white">{opportunity.title}</h1>
                </div>
              </div>
            )}
            
            {/* Content */}
            <div className="p-6">
              {/* Key Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-2">
                <div className="flex items-start">
                  <div className="mr-3 mt-1 text-green-600">
                    <FiCalendar size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Date & Time</h3>
                    <p className="text-gray-600">
                      {format(new Date(opportunity.startDate), 'MMMM d, yyyy')} at {format(new Date(opportunity.startDate), 'h:mm a')}
                    </p>
                    {opportunity.endDate && (
                      <p className="text-gray-600">
                        Until {format(new Date(opportunity.endDate), 'MMMM d, yyyy')} at {format(new Date(opportunity.endDate), 'h:mm a')}
                      </p>
                    )}
                    {isEventPast && (
                      <p className="text-orange-600 font-medium mt-1">This event has already passed</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-3 mt-1 text-green-600">
                    <FiMapPin size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Location</h3>
                    <p className="text-gray-600">{opportunity.location}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="mr-3 mt-1 text-green-600">
                    <FiUsers size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Participants</h3>
                    <p className="text-gray-600">
                      {opportunity._count.participants} people signed up
                      {opportunity.maxParticipants && ` (max ${opportunity.maxParticipants})`}
                    </p>
                  </div>
                </div>
                
                {opportunity.skillsRequired && (
                  <div className="flex items-start">
                    <div className="mr-3 mt-1 text-green-600">
                      <FiClock size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700">Skills Required</h3>
                      <p className="text-gray-600">{opportunity.skillsRequired}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">About This Opportunity</h2>
                <div className="text-gray-700 whitespace-pre-line">
                  {opportunity.description}
                </div>
              </div>
              
              {/* Organizer */}
              <div className="flex items-center mb-8 p-4 bg-gray-50 rounded-lg">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 mr-3">
                  {opportunity.organizer.image ? (
                    <Image
                      src={opportunity.organizer.image}
                      alt={opportunity.organizer.name || "Organizer"}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <FiUsers />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Organized by</p>
                  <p className="font-medium text-gray-800">{opportunity.organizer.name || "Anonymous"}</p>
                </div>
              </div>
              
              {/* Sign Up Button - only for future events */}
              {!isEventPast && (
                <div className="border-t border-gray-200 pt-6">
                  {!participantStatus.isParticipating ? (
                    <button
                      onClick={handleSignUp}
                      disabled={isSigningUp || !session || (opportunity.maxParticipants != null && opportunity._count.participants >= opportunity.maxParticipants)}
                      className={`w-full md:w-auto px-6 py-3 rounded-lg font-medium text-center ${
                        !session
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : opportunity.maxParticipants != null && opportunity._count.participants >= opportunity.maxParticipants
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      } transition focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2`}
                    >
                      <FiUserPlus className="inline mr-2" />
                      {isSigningUp
                        ? 'Signing up...'
                        : !session
                        ? 'Sign in to Participate'
                        : opportunity.maxParticipants != null && opportunity._count.participants >= opportunity.maxParticipants
                        ? 'Event Full'
                        : 'Sign Up to Participate'}
                    </button>
                  ) : (
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="mb-4 md:mb-0">
                        <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full">
                          <FiCheck className="mr-2" />
                          You're signed up for this opportunity
                        </div>
                      </div>
                      <button
                        onClick={handleCancelParticipation}
                        disabled={isSigningUp}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        {isSigningUp ? 'Cancelling...' : 'Cancel Participation'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
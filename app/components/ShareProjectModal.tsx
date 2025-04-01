'use client';

import { useState, useEffect } from 'react';
import { FiX, FiSearch, FiShare2, FiUser } from 'react-icons/fi';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  image: string | null;
}

interface ShareProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
}

export default function ShareProjectModal({
  isOpen,
  onClose,
  projectId,
  projectTitle
}: ShareProjectModalProps) {
  const router = useRouter();
  const [followedUsers, setFollowedUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sharingWith, setSharingWith] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [shareError, setShareError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchFollowedUsers();
    }
  }, [isOpen]);

  const fetchFollowedUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/users/following');
      
      if (!response.ok) {
        throw new Error('Failed to fetch followed users');
      }
      
      const data = await response.json();
      setFollowedUsers(data.users);
    } catch (err) {
      console.error('Error fetching followed users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (userId: string) => {
    setShareError('');
    setShareSuccess(false);
    setSharingWith(userId);
    
    try {
      const response = await fetch('/api/messages/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiverId: userId,
          content: `Check out this project:`,
          metadata: {
            type: 'project_share',
            projectId: projectId,
            projectTitle: projectTitle
          }
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to share project');
      }
      
      setShareSuccess(true);
      setSharingWith(null);
      
      // Optionally navigate to the conversation with the user
      // router.push(`/messages/${userId}`);
    } catch (err: any) {
      console.error('Error sharing project:', err);
      setShareError(err.message || 'Failed to share project');
      setSharingWith(null);
    }
  };

  const filteredUsers = followedUsers.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-800">Share Project</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={20} />
          </button>
        </div>
        
        {shareSuccess && (
          <div className="p-4 bg-green-50 text-green-700 border-b border-green-200">
            Project shared successfully!
          </div>
        )}
        
        {shareError && (
          <div className="p-4 bg-red-50 text-red-700 border-b border-red-200">
            {shareError}
          </div>
        )}
        
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              placeholder="Search for people you follow..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-pulse">Loading users...</div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? 'No matching users found' : 'You are not following anyone yet'}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <li key={user.id}>
                  <button
                    onClick={() => handleShare(user.id)}
                    disabled={sharingWith === user.id}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                        {user.image ? (
                          <Image
                            src={user.image}
                            alt={user.name || 'User'}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <FiUser className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <h4 className="font-medium text-gray-900">
                          {user.name || 'Unknown User'}
                        </h4>
                      </div>
                    </div>
                    
                    {sharingWith === user.id ? (
                      <div className="text-sm text-gray-500 animate-pulse">
                        Sharing...
                      </div>
                    ) : (
                      <div className="text-green-600">
                        <FiShare2 />
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useState } from 'react';
import { FiShare2 } from 'react-icons/fi';
import ShareProjectModal from './ShareProjectModal';

interface ProjectShareButtonProps {
  projectId: string;
  projectTitle: string;
}

export default function ProjectShareButton({ projectId, projectTitle }: ProjectShareButtonProps) {
  const [showShareModal, setShowShareModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowShareModal(true)}
        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
        aria-label="Share project"
      >
        <FiShare2 />
        <span>Share</span>
      </button>

      <ShareProjectModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        projectId={projectId}
        projectTitle={projectTitle}
      />
    </>
  );
} 
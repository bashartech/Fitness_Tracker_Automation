'use client';

import { useState } from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievement: string;
}

export default function ShareModal({ isOpen, onClose, achievement }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareText = `Just achieved: ${achievement} #FitnessTracker`;
  const shareUrl = `${window.location.origin}/share?achievement=${encodeURIComponent(achievement)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(facebookUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex text-black justify-between items-center mb-4">
          <h3 className="text-lg  text-gray-900 font-medium">Share Achievement</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-700 mb-2">{achievement}</p>
          <p className="text-sm text-gray-500 mb-4">Share this achievement with your friends!</p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleTwitterShare}
            className="flex-1 cursor-pointer bg-gray-900 px-4 py-2 bg-blue-400 text-gray-300  rounded hover:bg-blue-500"
          >
            Twitter
          </button>
          <button
            onClick={handleFacebookShare}
            className="flex-1 px-4 py-2 bg-blue-600  rounded text-gray-900  hover:bg-blue-700"
          >
            Facebook
          </button>
        </div>

        <div className="mt-4">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 text-gray-900  rounded text-sm"
          />
          <button
            onClick={handleCopy}
            className="mt-2 w-full px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-900"
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>
    </div>
  );
}
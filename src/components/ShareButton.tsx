import React, { useState } from 'react';

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({
  url,
  title,
  description,
  className = ''
}) => {
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);

  const shareOptions = [
    {
      name: 'Twitter',
      icon: '🐦',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      color: '#1DA1F2'
    },
    {
      name: 'Facebook',
      icon: '📘',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: '#4267B2'
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      color: '#0077B5'
    },
    {
      name: 'Reddit',
      icon: '🤖',
      url: `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
      color: '#FF4500'
    },
    {
      name: 'Email',
      icon: '📧',
      url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description || '')}%0A%0A${encodeURIComponent(url)}`,
      color: '#EA4335'
    }
  ];

  const handleShare = async (platform: typeof shareOptions[0]) => {
    if (platform.name === 'Email') {
      window.open(platform.url);
    } else {
      window.open(platform.url, '_blank', 'width=600,height=400');
    }

    // Track share event
    if (window.analytics) {
      window.analytics.track('article_shared', {
        platform: platform.name,
        url,
        title
      });
    }

    setIsShareMenuOpen(false);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url
        });

        // Track native share
        if (window.analytics) {
          window.analytics.track('article_shared', {
            platform: 'native',
            url,
            title
          });
        }
      } catch (error) {
        console.log('Share cancelled or failed:', error);
      }
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.textContent = 'Link copied to clipboard!';
      successMessage.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 2000);

      // Track copy event
      if (window.analytics) {
        window.analytics.track('article_link_copied', { url, title });
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <div className={`share-button-container ${className}`}>
      <button
        onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
        className="share-button"
        aria-label="Share article"
        aria-expanded={isShareMenuOpen}
        aria-haspopup="true"
      >
        📤 Share
      </button>

      {isShareMenuOpen && (
        <div className="share-menu">
          <div className="share-menu-header">
            <h3>Share this article</h3>
            <button
              onClick={() => setIsShareMenuOpen(false)}
              className="close-button"
              aria-label="Close share menu"
            >
              ✕
            </button>
          </div>

          {'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="share-option native-share"
            >
              📱 Share via...
            </button>
          )}

          <div className="share-options-grid">
            {shareOptions.map((platform) => (
              <button
                key={platform.name}
                onClick={() => handleShare(platform)}
                className="share-option"
                style={{ '--platform-color': platform.color } as React.CSSProperties}
                aria-label={`Share on ${platform.name}`}
              >
                <span className="share-icon">{platform.icon}</span>
                <span className="share-name">{platform.name}</span>
              </button>
            ))}
          </div>

          <button
            onClick={copyToClipboard}
            className="share-option copy-link"
          >
            📋 Copy Link
          </button>
        </div>
      )}

      {/* Overlay to close menu when clicking outside */}
      {isShareMenuOpen && (
        <div
          className="share-overlay"
          onClick={() => setIsShareMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default ShareButton;

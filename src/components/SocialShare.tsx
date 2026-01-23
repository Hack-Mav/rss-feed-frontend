import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAnalytics } from '../hooks/useAnalytics';
import './SocialShare.css';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  className?: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ 
  url, 
  title, 
  description, 
  className = '' 
}) => {
  const { t } = useTranslation();
  const { trackUserAction } = useAnalytics();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || '');

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
    mastodon: `https://mastodon.social/share?text=${encodedTitle}%20${encodedUrl}`
  };

  const handleShare = (platform: string) => {
    trackUserAction('share_article', { platform, url, title });
    
    if (platform === 'clipboard') {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedToClipboard(true);
        setTimeout(() => setCopiedToClipboard(false), 2000);
      });
    } else {
      const shareUrl = shareUrls[platform as keyof typeof shareUrls];
      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
      }
    }
    setShowShareMenu(false);
  };

  const shareButtons = [
    { platform: 'twitter', icon: '🐦', label: 'Twitter' },
    { platform: 'facebook', icon: '📘', label: 'Facebook' },
    { platform: 'linkedin', icon: '💼', label: 'LinkedIn' },
    { platform: 'reddit', icon: '🤖', label: 'Reddit' },
    { platform: 'whatsapp', icon: '💬', label: 'WhatsApp' },
    { platform: 'telegram', icon: '✈️', label: 'Telegram' },
    { platform: 'email', icon: '📧', label: 'Email' },
    { platform: 'mastodon', icon: '🐘', label: 'Mastodon' },
    { platform: 'clipboard', icon: '📋', label: copiedToClipboard ? 'Copied!' : 'Copy Link' }
  ];

  return (
    <div className={`social-share ${className}`}>
      <button
        onClick={() => setShowShareMenu(!showShareMenu)}
        className="share-button"
        aria-label={t('socialShare.shareArticle')}
        aria-expanded={showShareMenu}
        aria-haspopup="true"
      >
        📤 {t('socialShare.share')}
      </button>
      
      {showShareMenu && (
        <div className="share-menu" role="menu">
          <div className="share-menu-header">
            <h4>{t('socialShare.shareArticle')}</h4>
            <button
              onClick={() => setShowShareMenu(false)}
              className="close-button"
              aria-label={t('common.close')}
            >
              ✕
            </button>
          </div>
          <div className="share-buttons-grid">
            {shareButtons.map(({ platform, icon, label }) => (
              <button
                key={platform}
                onClick={() => handleShare(platform)}
                className="share-platform-button"
                role="menuitem"
                aria-label={`${label} ${t('socialShare.share')}`}
              >
                <span className="share-icon">{icon}</span>
                <span className="share-label">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialShare;

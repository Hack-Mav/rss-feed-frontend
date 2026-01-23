import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAnalytics } from '../hooks/useAnalytics';
import './CommentsSection.css';

interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: number;
  articleUrl: string;
  isLocal?: boolean;
}

interface CommentsSectionProps {
  articleUrl: string;
  articleTitle: string;
  className?: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ 
  articleUrl, 
  articleTitle,
  className = '' 
}) => {
  const { t } = useTranslation();
  const { trackUserAction } = useAnalytics();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // Load comments from localStorage
  useEffect(() => {
    const storedComments = localStorage.getItem(`comments_${articleUrl}`);
    if (storedComments) {
      try {
        const parsedComments = JSON.parse(storedComments);
        setComments(parsedComments);
      } catch (error) {
        console.error('Error loading comments:', error);
      }
    }
  }, [articleUrl]);

  // Save comments to localStorage
  const saveComments = (updatedComments: Comment[]) => {
    localStorage.setItem(`comments_${articleUrl}`, JSON.stringify(updatedComments));
    setComments(updatedComments);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim() || !authorName.trim()) {
      return;
    }

    setIsSubmitting(true);

    const comment: Comment = {
      id: Date.now().toString(),
      author: authorName.trim(),
      content: newComment.trim(),
      timestamp: Date.now(),
      articleUrl,
      isLocal: true
    };

    try {
      // In a real app, you'd send this to a backend
      const updatedComments = [...comments, comment];
      saveComments(updatedComments);
      
      trackUserAction('add_comment', { 
        articleUrl, 
        articleTitle,
        commentLength: newComment.length 
      });

      setNewComment('');
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error submitting comment:', error);
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = (commentId: string) => {
    const updatedComments = comments.filter(comment => comment.id !== commentId);
    saveComments(updatedComments);
    
    trackUserAction('delete_comment', { 
      articleUrl, 
      articleTitle,
      commentId 
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const commentCount = comments.length;

  return (
    <div className={`comments-section ${className}`}>
      <div className="comments-header">
        <button
          onClick={() => setShowComments(!showComments)}
          className="comments-toggle"
          aria-expanded={showComments}
        >
          💬 {t('comments.title')} ({commentCount})
        </button>
      </div>

      {showComments && (
        <div className="comments-content">
          {/* Add Comment Form */}
          <div className="add-comment">
            <h4>{t('comments.addComment')}</h4>
            <form onSubmit={handleSubmitComment}>
              <div className="form-group">
                <label htmlFor="author-name">{t('comments.name')}</label>
                <input
                  id="author-name"
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder={t('comments.namePlaceholder')}
                  required
                  maxLength={50}
                />
              </div>
              <div className="form-group">
                <label htmlFor="comment-content">{t('comments.comment')}</label>
                <textarea
                  id="comment-content"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={t('comments.commentPlaceholder')}
                  required
                  maxLength={500}
                  rows={4}
                />
                <small>{newComment.length}/500</small>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim() || !authorName.trim()}
                className="submit-comment-button"
              >
                {isSubmitting ? t('comments.submitting') : t('comments.submit')}
              </button>
            </form>
          </div>

          {/* Comments List */}
          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="no-comments">{t('comments.noComments')}</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="comment">
                  <div className="comment-header">
                    <strong>{comment.author}</strong>
                    <span className="comment-timestamp">
                      {formatDate(comment.timestamp)}
                    </span>
                    {comment.isLocal && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="delete-comment-button"
                        aria-label={t('comments.delete')}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                  <div className="comment-content">
                    {comment.content}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentsSection;

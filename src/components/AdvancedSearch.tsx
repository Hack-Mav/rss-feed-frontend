import { useState, useRef } from 'react';
import type { SearchSuggestion } from '../types';

interface AdvancedSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  suggestions: SearchSuggestion[];
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  onClearHistory: () => void;
}

const AdvancedSearch = ({
  searchTerm,
  onSearchChange,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  onClearHistory
}: AdvancedSearchProps) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onSearchChange(value);
    setFocusedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0) {
          onSearchChange(suggestions[focusedIndex].text);
          setShowSuggestions(false);
          setFocusedIndex(-1);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setFocusedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onSearchChange(suggestion.text);
    setShowSuggestions(false);
    setFocusedIndex(-1);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => setShowSuggestions(false), 150);
  };

  const getHelpText = () => {
    if (searchTerm.includes(' AND ')) return 'AND: All terms must be present';
    if (searchTerm.includes(' OR ')) return 'OR: Any term can be present';
    if (searchTerm.includes(' NOT ')) return 'NOT: Exclude terms';
    return 'Try: "term1 AND term2", "term1 OR term2", or "term1 NOT term2"';
  };

  return (
    <div className="advanced-search-container" style={{ position: 'relative', flex: 1 }}>
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search with operators (AND, OR, NOT)..."
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          style={{
            width: '100%',
            padding: '0.5rem 2.5rem 0.5rem 0.5rem',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '1rem',
            boxSizing: 'border-box'
          }}
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange('')}
            style={{
              position: 'absolute',
              right: '0.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2rem',
              color: '#666'
            }}
            title="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Search suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          className="search-suggestions"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderTop: 'none',
            borderRadius: '0 0 4px 4px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.type}-${index}`}
              className={`suggestion-item ${focusedIndex === index ? 'focused' : ''}`}
              onClick={() => handleSuggestionClick(suggestion)}
              style={{
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                backgroundColor: focusedIndex === index ? '#f0f0f0' : 'white',
                borderBottom: index < suggestions.length - 1 ? '1px solid #eee' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span style={{ 
                fontSize: '0.8rem', 
                color: suggestion.type === 'history' ? '#666' : '#999',
                minWidth: '60px'
              }}>
                {suggestion.type === 'history' ? '🕐' : '💡'}
                {suggestion.type === 'history' ? ' Recent' : ' Suggest'}
              </span>
              <span>{suggestion.text}</span>
            </div>
          ))}
          {suggestions.some(s => s.type === 'history') && (
            <div
              className="clear-history"
              onClick={onClearHistory}
              style={{
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                backgroundColor: '#f8f9fa',
                borderTop: '1px solid #ddd',
                fontSize: '0.875rem',
                color: '#666',
                textAlign: 'center'
              }}
            >
              Clear Search History
            </div>
          )}
        </div>
      )}

      {/* Search help text */}
      <div style={{ 
        fontSize: '0.75rem', 
        color: '#666', 
        marginTop: '0.25rem',
        fontStyle: 'italic'
      }}>
        {getHelpText()}
      </div>
    </div>
  );
};

export default AdvancedSearch;

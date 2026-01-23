import { useState, useCallback, memo } from "react";
import { InlineSpinner } from "./Skeleton";
import apiService from "../services/api";
import "../App.css";

interface CustomFeedInputProps {
    onFeedSelect: (url: string) => Promise<void>;
}

const CustomFeedInput = memo(({ onFeedSelect }: CustomFeedInputProps) => {
    const [customUrl, setCustomUrl] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [isValidating, setIsValidating] = useState<boolean>(false);
    const [validationResult, setValidationResult] = useState<{ valid: boolean; error: string; url: string } | null>(null);

    const validateUrl = useCallback((url: string) => {
        if (!url || url.trim() === '') {
            return { valid: false, error: "Please enter an RSS feed URL.", url: "" };
        }

        const result = apiService.validateRSSUrl(url);
        setValidationResult(result);
        return result;
    }, []);

    const handleFetch = useCallback(async () => {
        const validation = validateUrl(customUrl);
        
        if (!validation.valid) {
            setError(validation.error);
            return;
        }

        setIsValidating(true);
        setError(null);
        
        try {
            await onFeedSelect(validation.url);
        } catch (error) {
            setError("Failed to fetch RSS feed. Please check URL and try again.");
        } finally {
            setIsValidating(false);
        }
    }, [customUrl, validateUrl, onFeedSelect]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setCustomUrl(value);
        
        if (error) {
            setError(null);
        }
    }, [error]);

    const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleFetch();
        }
    }, [handleFetch]);

    return (
        <div className="custom-feed-container">
            <h2 className="custom-feed-title">
                🔗 Custom RSS Feed
            </h2>
            <div className="custom-feed-controls">
                <input
                    type="url"
                    value={customUrl}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter RSS feed URL..."
                    className={`custom-feed-input ${error ? 'error' : ''}`}
                    disabled={isValidating}
                    aria-label="Custom RSS feed URL"
                    aria-invalid={!!error}
                    aria-describedby={error ? "url-error" : undefined}
                />
                <button
                    onClick={handleFetch}
                    disabled={isValidating || !customUrl.trim()}
                    className="custom-feed-button"
                    aria-label="Fetch custom RSS feed"
                >
                    {isValidating ? <InlineSpinner /> : "Add Feed"}
                </button>
            </div>
            
            {error && (
                <div 
                    id="url-error"
                    className="error-message" 
                    role="alert" 
                    aria-live="polite"
                    style={{
                        color: 'var(--color-danger)',
                        fontSize: 'var(--font-size-sm)',
                        marginTop: 'var(--spacing-sm)',
                        textAlign: 'center'
                    }}
                >
                    {error}
                </div>
            )}
            
            {validationResult && !validationResult.valid && (
                <div 
                    className="validation-message"
                    style={{
                        color: 'var(--color-warning)',
                        fontSize: 'var(--font-size-sm)',
                        marginTop: 'var(--spacing-sm)',
                        textAlign: 'center'
                    }}
                >
                    {validationResult.error}
                </div>
            )}
        </div>
    );
});

CustomFeedInput.displayName = 'CustomFeedInput';

export default CustomFeedInput;

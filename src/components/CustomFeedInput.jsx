import { useState } from "react";
import PropTypes from "prop-types";
import "../App.css"; // Import styles

const CustomFeedInput = ({ onFeedSelect }) => {
    const [customUrl, setCustomUrl] = useState("");

    const handleFetch = () => {
        if (customUrl) {
            onFeedSelect(customUrl);
        }
    };

    return (
        <div className="custom-feed-container">
            <h2 className="custom-feed-title">Enter a Custom RSS Feed URL</h2>
            <div className="custom-feed-controls">
                <input
                    type="text"
                    className="custom-feed-input"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="Enter RSS Feed URL"
                />
                <button
                    className="custom-feed-button"
                    onClick={handleFetch}
                    disabled={!customUrl}
                >
                    Fetch Feed
                </button>
            </div>
        </div>
    );
};

// Define PropTypes for CustomFeedInput
CustomFeedInput.propTypes = {
    onFeedSelect: PropTypes.func.isRequired,
};

export default CustomFeedInput;

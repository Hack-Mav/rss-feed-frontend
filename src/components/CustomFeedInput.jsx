import React, { useState } from "react";
import PropTypes from "prop-types";

const CustomFeedInput = ({ onFeedSelect }) => {
    const [customUrl, setCustomUrl] = useState("");

    const handleFetch = () => {
        if (customUrl) {
            onFeedSelect(customUrl);
        }
    };

    return (
        <div>
            <h2>Enter a Custom RSS Feed URL</h2>
            <input
                type="text"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="Enter RSS Feed URL"
            />
            <button onClick={handleFetch} disabled={!customUrl}>
                Fetch Feed
            </button>
        </div>
    );
};

// Define PropTypes for CustomFeedInput
CustomFeedInput.propTypes = {
    onFeedSelect: PropTypes.func.isRequired,
};

export default CustomFeedInput;

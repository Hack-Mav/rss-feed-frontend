import { useState, useEffect } from "react";
import PropTypes from "prop-types"; // Import PropTypes
import axios from "axios";
import "../App.css"; // Import styles

const FeedSelector = ({ onFeedSelect }) => {
    const [feeds, setFeeds] = useState([]);
    const [selectedFeed, setSelectedFeed] = useState("");

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_URL}/feeds`)
            .then((response) => setFeeds(response.data))
            .catch((error) => console.error("Error fetching feeds:", error));
    }, []);

    const handleFeedSelection = () => {
        if (selectedFeed) {
            onFeedSelect(selectedFeed);
        }
    };

    return (
        <div className="feed-selector-container">
            <h2 className="feed-selector-title">Select a Predefined Feed</h2>
            <div className="feed-selector-controls">
                <select
                    className="feed-selector-dropdown"
                    value={selectedFeed}
                    onChange={(e) => setSelectedFeed(e.target.value)}
                >
                    <option value="">-- Select a Feed --</option>
                    {feeds.map((feed, index) => (
                        <option key={index} value={feed.url}>
                            {feed.name}
                        </option>
                    ))}
                </select>
                <button
                    className="feed-selector-button"
                    onClick={handleFeedSelection}
                    disabled={!selectedFeed}
                >
                    Fetch Feed
                </button>
            </div>
        </div>
    );
};

// Define PropTypes for FeedSelector
FeedSelector.propTypes = {
    onFeedSelect: PropTypes.func.isRequired,
};

export default FeedSelector;

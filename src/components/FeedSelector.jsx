import { useState, useEffect } from "react";
import PropTypes from "prop-types"; // Import PropTypes
import axios from "axios";

const FeedSelector = ({ onFeedSelect }) => {
    const [feeds, setFeeds] = useState([]);
    const [selectedFeed, setSelectedFeed] = useState("");

    useEffect(() => {
        axios.get("/feeds")
            .then((response) => setFeeds(response.data))
            .catch((error) => console.error("Error fetching feeds:", error));
    }, []);

    const handleFeedSelection = () => {
        if (selectedFeed) {
            onFeedSelect(selectedFeed);
        }
    };

    return (
        <div>
            <h2>Select a Predefined Feed</h2>
            <select
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
            <button onClick={handleFeedSelection} disabled={!selectedFeed}>
                Fetch Feed
            </button>
        </div>
    );
};

// Define PropTypes for FeedSelector
FeedSelector.propTypes = {
    onFeedSelect: PropTypes.func.isRequired,
};

export default FeedSelector;

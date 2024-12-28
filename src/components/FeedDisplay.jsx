import { useState } from "react";
import PropTypes from "prop-types";
import "../App.css"; // Import CSS for styling

const FeedDisplay = ({ feedItems }) => {
    const [expandedIndex, setExpandedIndex] = useState(null);

    const handleReadMore = (index) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <div className="feed-container">
            <h2>RSS Feed Items</h2>
            {Array.isArray(feedItems) && feedItems.length === 0 ? (
                <p>No feed items to display.</p>
            ) : Array.isArray(feedItems) ? (
                <div className="feed-grid">
                    {feedItems.map((item, index) => (
                        <div key={index} className="feed-item">
                            <h3>{item.Title}</h3>
                            {item.Description}
                            {expandedIndex === index ? (
                                <div className="feed-details">
                                    <p>Publication Date: {item.PubDate || "Unknown"}</p>
                                    <p>Author: {item.Author || "Unknown"}</p>
                                    <a
                                        href={item.Link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ display: "block", marginTop: "0.2rem" }}
                                    >
                                        Visit the Full Article
                                    </a>
                                    <button onClick={() => handleReadMore(index)}>
                                        Show Less
                                    </button>
                                </div>
                            ) : (
                                <button onClick={() => handleReadMore(index)}>
                                    Read More
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p>Unexpected data format. Please try again later.</p>
            )}
        </div>
    );
};

FeedDisplay.propTypes = {
    feedItems: PropTypes.arrayOf(
        PropTypes.shape({
            Title: PropTypes.string.isRequired,
            Description: PropTypes.string.isRequired,
            Link: PropTypes.string.isRequired,
            PubDate: PropTypes.string,
            Author: PropTypes.string,
        })
    ).isRequired,
};

export default FeedDisplay;

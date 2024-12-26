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
                <ul className="feed-list">
                    {feedItems.map((item, index) => (
                        <li key={index} className="feed-item">
                            <h3>{item.Title}</h3>
                            <p>{item.Description}</p>
                            {expandedIndex === index ? (
                                <div className="feed-details">
                                    <p>Publication Date: {item.PubDate || "Unknown"}</p>
                                    <p>Author: {item.Author || "Unknown"}</p>
                                    <a
                                        href={item.Link}
                                        target="_blank"
                                        rel="noopener noreferrer"
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
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Unexpected data format. Please try again later.</p>
            )}
        </div>
    );
};

FeedDisplay.propTypes = {
    feedItems: PropTypes.arrayOf(
        PropTypes.shape({
            title: PropTypes.string.isRequired,
            description: PropTypes.string.isRequired,
            link: PropTypes.string.isRequired,
            pubDate: PropTypes.string,
            author: PropTypes.string,
        })
    ).isRequired,
};

export default FeedDisplay;

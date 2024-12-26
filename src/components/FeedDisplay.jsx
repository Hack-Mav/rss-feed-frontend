import React, { useState } from "react";
import PropTypes from "prop-types";

const FeedDisplay = ({ feedItems }) => {
    const [expandedIndex, setExpandedIndex] = useState(null); // Track the expanded item

    const handleReadMore = (index) => {
        // Toggle expansion
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    return (
        <div>
            <h2>RSS Feed Items</h2>
            {Array.isArray(feedItems) && feedItems.length === 0 ? (
                <p>No feed items to display.</p>
            ) : Array.isArray(feedItems) ? (
                <ul>
                    {feedItems.map((item, index) => (
                        <li key={index}>
                            <h3>{item.Title}</h3>
                            <p>{item.description}</p>

                            {/* Read More Section */}
                            {expandedIndex === index ? (
                                <div>
                                    <p>
                                        Here you can display additional details about this feed item. For example:
                                    </p>
                                    <ul>
                                        <li>Publication Date: {item.pubDate || "Unknown"}</li>
                                        <li>Author: {item.author || "Unknown"}</li>
                                    </ul>
                                    <p>
                                        <a
                                            href={item.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: "blue", textDecoration: "underline" }}
                                        >
                                            Visit the Full Article
                                        </a>
                                    </p>
                                    <button onClick={() => handleReadMore(index)}>
                                        Show Less
                                    </button>
                                </div>
                            ) : (
                                <button onClick={() => handleReadMore(index)}>Read More</button>
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

// PropTypes validation
FeedDisplay.propTypes = {
    feedItems: PropTypes.arrayOf( 
        PropTypes.shape({
            title: PropTypes.string.isRequired,
            description: PropTypes.string.isRequired,
            link: PropTypes.string.isRequired,
            pubDate: PropTypes.string, // Optional
            author: PropTypes.string, // Optional
        })
    ).isRequired,
};

export default FeedDisplay;

import React from "react";
import PropTypes from "prop-types";

const FeedDisplay = ({ feedItems }) => {
    console.log("Feed Items in Display:", feedItems); // Debugging output

    return (
        <div>
            <h2>RSS Feed Items</h2>
            {Array.isArray(feedItems) && feedItems.length === 0 ? (
                <p>No feed items to display.</p>
            ) : Array.isArray(feedItems) ? (
                <ul>
                    {feedItems.map((item, index) => (
                        <li key={index}>
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                            <a href={item.link} target="_blank" rel="noopener noreferrer">
                                Read More
                            </a>
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
    feedItems: PropTypes.array.isRequired, // Ensure feedItems is an array
};

export default FeedDisplay;

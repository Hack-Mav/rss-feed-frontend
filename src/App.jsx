import { useState } from "react";
import FeedSelector from "./components/FeedSelector";
import CustomFeedInput from "./components/CustomFeedInput";
import FeedDisplay from "./components/FeedDisplay";
import axios from "axios";

const App = () => {
    const [feedItems, setFeedItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchFeed = (url) => {
        setLoading(true);
        axios
            .get(`${import.meta.env.VITE_API_URL}/fetch-store?url=${encodeURIComponent(url)}`)
            .then((response) => {
                console.log("API Response:", response.data); // Inspect the API response
                // Ensure response.data is an array
                if (Array.isArray(response.data)) {
                    setFeedItems(response.data);
                } else {
                    console.error("Unexpected response format:", response.data);
                    setFeedItems([]); // Reset to empty array if format is incorrect
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching feed:", error);
                setLoading(false);
            });
    };    

    return (
        <div id="root">
          <header>
            <h1>RSS Feed Reader</h1>
            <p>Stay updated with the latest articles from your favorite sources.</p>
          </header>
    
          <div className="card">
            {/* <h2>Select an RSS Feed</h2> */}
            <FeedSelector onFeedSelect={fetchFeed} />
            <CustomFeedInput onFeedSelect={fetchFeed} />
          </div>
    
          <div className="feed-container">
            {loading ? <p>Loading feed items...</p> : <FeedDisplay feedItems={feedItems} />}
          </div>
        </div>
      );
};

export default App;

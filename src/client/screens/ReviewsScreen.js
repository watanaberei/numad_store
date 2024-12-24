import { parseRequestUrl } from "../utils.js";
import YelpReviews from "../components/YelpReviews.js";
import { YelpApi } from "../components/YelpApi.js"; 

const ReviewsScreen = {
  render: async () => {
    const store = parseRequestUrl().slug;
    const storeDetails = await YelpApi(store); // Fetching the storeDetails from YelpApi

    // Check if storeDetails is not null or undefined before calling map()
    let storeDetailsHTML = '';
    if(storeDetails) {
      // Use Promise.all to wait for all promises to resolve
      storeDetailsHTML = await Promise.all(
        storeDetails.map((store) => YelpReviews.render(store))
      ).join('');
    }

    return `
      <div>
        <form id="search-form">
          <input type="text" id="search-term" placeholder="Search for a store" />
          <button type="submit">Search</button>
        </form>

        <div id="store-details">
        ${storeDetailsHTML}
      </div>
    </div>
    `;
  },
  after_render: () => {
    document.getElementById("search-form").addEventListener("submit", async (e) => {
      e.preventDefault(); // prevents the page from refreshing
      const searchTerm = document.getElementById("search-term").value;
      const storeDetails = await YelpApi(searchTerm); // Fetching the storeDetails from YelpApi
      let storeDetailsHTML = '';
      if(storeDetails) {
        storeDetailsHTML = await Promise.all(
          storeDetails.map((store) => YelpReviews.render(store))
        );
      }
    
      document.getElementById("store-details").innerHTML = storeDetailsHTML.join('');
    });

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  },
};

export default ReviewsScreen;

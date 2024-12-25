// src/services/api.js
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { documentToPlainTextString } from "@contentful/rich-text-plain-text-renderer";
import { resolveApiPath } from './utils/paths.js';
import { handleError } from './utils/errors.js';

// Line 7-10: Contentful client setup
const client = require('contentful').createClient({
  space: 'i1hcb4885ci0',
  accessToken: 'Bcy-B6Lvepv3RLYinX-rY9x4KDpxJcv8_IH0PgF6odw'
});



// const API_URL = 'http://localhost:6000';
  // dotenv.config();

// const client = createClient({
//   space: "i1hcb4885ci0",
//   accessToken: "Bcy-B6Lvepv3RLYinX-rY9x4KDpxJcv8_IH0PgF6odw",
// });

// // curl https://cdn.contentful.com/spaces/i1hcb4885ci0/entries?access_token=Bcy-B6Lvepv3RLYinX-rY9x4KDpxJcv8_IH0PgF6odw


// const CONTENTFUL_SPACE_ID = 'i1hcb4885ci0';
// const CONTENTFUL_ACCESS_TOKEN = 'Bcy-B6Lvepv3RLYinX-rY9x4KDpxJcv8_IH0PgF6odw';


const API_URL = 'http://localhost:6000';

// Line 15-45: GraphQL queries for different content types
const queries = {
  storeQuery: `
    query GetStore($id: ID!) {
      store(id: $id) {
        id
        title
        slug
        location {
          address
          coordinates {
            lat
            lng
          }
        }
        category {
          categoryType
        }
        reviews {
          id
          rating
          content
        }
      }
    }
  `,
  
  articleQuery: `
    query GetArticles($limit: Int, $skip: Int) {
      articleCollection(limit: $limit, skip: $skip) {
        items {
          sys {
            id
          }
          title
          slug
          content
          tags
        }
      }
    }
  `
};

// Line 48-63: Helper function for handling fetch errors
const handleFetchError = (error, operation) => {
  console.error(`Error during ${operation}:`, error);
  return {
    error: true,
    message: error.message,
    operation: operation
  };
};

// Line 66-89: getStore function with GraphQL support
export const getStore = async (params = {}) => {
  try {
    console.log('Fetching stores with params:', params);
    
    // If we have a specific storeId, use GraphQL query
    if (params.storeId) {
      const response = await fetch(`${API_URL}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: queries.storeQuery,
          variables: { id: params.storeId }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data.store;
    }

    // Otherwise use REST API for listing stores
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
      
    const response = await fetch(`${API_URL}/api/stores${queryString ? `?${queryString}` : ''}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return handleFetchError(error, 'getStore');
  }
};

// Line 92-115: getArticleNeumadsTrail with GraphQL support
export const getArticleNeumadsTrail = async (limit = 9, skip = 0) => {
  try {
    const response = await fetch(`${API_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: queries.articleQuery,
        variables: { limit, skip }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    if (data.errors) {
      console.error('articleNeumadsTrail GraphQL errors:', data.errors);
      throw new Error('GraphQL query failed');
    }

    return data.data.articleCollection.items;
  } catch (error) {
    return handleFetchError(error, 'getArticleNeumadsTrail');
  }
};

// ... rest of your existing api.js code ...

// Server-side utilities only
import axios from 'axios';

export const makeServerRequest = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Server request failed:', error);
    throw error;
  }
};
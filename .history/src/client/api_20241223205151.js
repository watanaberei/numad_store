const API_URL = 'http://localhost:4000';

export const sendImpression = async (storeId, action) => {
  try {
    const response = await fetch(`${API_URL}/api/impressions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ storeId, action }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error sending impression:', error);
    throw error;
  }
};
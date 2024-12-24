export const withErrorBoundary = async (fn, fallback = null) => {
    try {
      return await fn();
    } catch (error) {
      console.error('Error caught in boundary:', error);
      return fallback;
    }
  };
// src/server/models/blogModel.js
// Optimized version of the GET /api/user/store endpoint
app.get('/api/user/store', authenticateToken, async (req, res) => {
    const userEmail = req.user.email;
    
    try {
      // Find the user by email
      const user = await UserModel.findOne({ email: userEmail });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      // Get current check-in and recent history
      const currentStore = user.checkedInStore;
      const recentCheckedInStores = user.checkedInStores.slice(-6).reverse();
      const storeIds = [...new Set([currentStore, ...recentCheckedInStores.map(store => store.storeId)])].filter(Boolean);
      
      // Find stores matching the IDs - use lean() for faster queries
      const stores = await StoreModel.find({ slug: { $in: storeIds } }).lean();
      
      // Map store data to include only necessary fields
      const storeData = stores.map(store => ({
        storeId: store.slug,
        storeInfo: {
          storeName: store.hero?.storeName,
          city: store.hero?.city,
          state: store.hero?.state,
          distance: store.hero?.distance,
          status: store.hero?.status,
          gallery: store.hero?.gallery,
          storeType: store.hero?.storeType,
          rating: store.hero?.rating,
          review_count: store.hero?.review_count
        }
      }));
  
      // Cache results
      res.set('Cache-Control', 'private, max-age=60'); // Cache for 60 seconds for authenticated users
      
      return res.status(200).json({
        success: true,
        currentStore: currentStore,
        stores: storeData,
        checkedInStores: recentCheckedInStores
      });
      
    } catch (error) {
      console.error(`[authServer] Error fetching store data:`, error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error fetching store data',
        error: error.message
      });
    }
  });
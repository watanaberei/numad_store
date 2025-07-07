// src/server/route/routeStore.js
import mongoose from 'mongoose';
import express from 'express';
import jwt from 'jsonwebtoken';
import { StoreModel, storeOperations } from '../../data/mongodb/mongodb.js';
import { UserModel } from '../../models/userModel.js';
import { Yelp } from '../../data/yelp/yelp.js';

const routeStore = express.Router();

console.log('[StoreAPI] Loading store routes with MongoDB integration');

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('[StoreAPI] No token provided');
    // Allow access without token for public endpoints
    req.user = null;
    return next();
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if (err) {
      console.log('[StoreAPI] Token verification failed:', err.message);
      req.user = null;
      return next();
    }
  
    try {
      const userData = await UserModel.findOne({ email: decoded.email })
        .select('_id email username firstName lastName')
        .maxTimeMS(5000);

      if (!userData) {
        console.log('[StoreAPI] User not found for token');
        req.user = null;
        return next();
      }

      req.user = {
        id: userData._id.toString(),
        email: userData.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName
      };

      console.log('[StoreAPI] Token verified for user:', req.user.username);
      
      next();
    } catch (error) {
      console.error('[StoreAPI] Error fetching user data:', error);
      req.user = null;
      next();
    }
  });
};

// GET STORE BY SLUG WITH COMPLETE DATA STRUCTURE
routeStore.get('/stores/:slug', authenticateToken, async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.id;
    
    console.log(`[StoreAPI routeStore.js line 65] Fetching store with slug: ${slug}`);
    
    // Get store from MongoDB with complete data structure
    const store = await storeOperations.getStoreForAPI(slug);
    
    if (!store) {
      console.log(`[StoreAPI routeStore.js line 71] Store not found in database: ${slug}`);
      return res.status(404).json({ 
        success: false,
        error: 'Store not found' 
      });
    }
    
    console.log(`[StoreAPI routeStore.js line 78] Found store in database: ${store.hero?.storeName || store.slug}`);
    
    // Increment view count
    await StoreModel.findByIdAndUpdate(store._id, {
      $inc: { 'interactions.views': 1 }
    });
    
    // Add user interaction status if authenticated
    if (userId) {
      const userInteractions = await StoreModel.findOne({ 
        slug,
        $or: [
          { 'interactions.likedBy': userId },
          { 'interactions.dislikedBy': userId },
          { 'interactions.checkedInBy.user': userId }
        ]
      }).select('interactions');
      
      if (userInteractions) {
        store.userLiked = userInteractions.interactions.likedBy.includes(userId);
        store.userDisliked = userInteractions.interactions.dislikedBy.includes(userId);
        store.userCheckedIn = userInteractions.interactions.checkedInBy.some(
          checkin => checkin.user.toString() === userId
        );
      }
    }
    
    console.log(`[StoreAPI routeStore.js line 106] Returning complete store data for: ${store.slug}`);
    
    return res.json({
      success: true,
      store: store
    });
    
  } catch (error) {
    console.error(`[StoreAPI routeStore.js line 114] Error fetching store: ${error.message}`);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch store' 
    });
  }
});

// SYNC STORE DATA FROM EXTERNAL SOURCE
routeStore.post('/stores/sync/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const storeData = req.body;
    
    console.log(`[StoreAPI routeStore.js line 128] Received sync request for slug: ${slug}`);
    console.log(`[StoreAPI routeStore.js line 129] Store data structure:`, {
      hasHero: !!storeData.hero,
      hasOverview: !!storeData.overview,
      hasService: !!storeData.service,
      hasExperience: !!storeData.experience,
      hasLocation: !!storeData.location,
      hasBusiness: !!storeData.business
    });
    
    if (!storeData) {
      console.error(`[StoreAPI routeStore.js line 139] No store data provided for slug: ${slug}`);
      return res.status(400).json({ 
        success: false, 
        message: 'No store data provided' 
      });
    }
    
    // Ensure data structure matches exactly what StoreScreen expects
    const completeStoreData = {
      slug: slug,
      title: storeData.hero?.storeName || storeData.title || 'Unknown Store',
      variant: 'stores',
      
      // Hero section - exactly as in JSON example
      hero: storeData.hero || {},
      
      // Overview section - must be an array
      overview: Array.isArray(storeData.overview) ? storeData.overview : [storeData.overview || {}],
      
      // Service section with nested category structure
      service: storeData.service || {},
      
      // Experience section with area and attribute structure
      experience: storeData.experience || {},
      
      // Location section with neighborhood data
      location: storeData.location || {},
      
      // Business section with Yelp timeline data
      business: storeData.business || {},
      
      // Additional data sections
      serviceCategoryData: storeData.serviceCategoryData || {},
      mapRadiusData: storeData.mapRadiusData || {},
      
      // All Yelp data sections
      yelpData: storeData.yelpData || null,
      yelpFoodData: storeData.yelpFoodData || null,
      yelpFusionData: storeData.yelpFusionData || null,
      yelpSearchData: storeData.yelpSearchData || null,
      yelpPhoneData: storeData.yelpPhoneData || null,
      yelpMatchData: storeData.yelpMatchData || null,
      yelpDetailsData: storeData.yelpDetailsData || null,
      yelpDeliveryData: storeData.yelpDeliveryData || null,
      yelpServiceData: storeData.yelpServiceData || null,
      yelpInsightData: storeData.yelpInsightData || null,
      
      // Timestamps
      lastUpdated: new Date(),
      lastSynced: new Date()
    };
    
    console.log(`[StoreAPI routeStore.js line 189] Saving store data for: ${completeStoreData.title}`);
    
    const result = await StoreModel.findOneAndUpdate(
      { slug: slug },
      completeStoreData,
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true 
      }
    );
    
    console.log(`[StoreAPI routeStore.js line 201] Store saved successfully: ${result.title} (ID: ${result._id})`);
    
    res.status(200).json({ 
      success: true, 
      message: 'Store data saved successfully',
      store: {
        id: result._id,
        slug: result.slug,
        title: result.title
      }
    });
    
  } catch (error) {
    console.error(`[StoreAPI routeStore.js line 215] Error saving store data:`, error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// SYNC STORE WITH YELP DATA
routeStore.post('/stores/:slug/sync-yelp', authenticateToken, async (req, res) => {
  try {
    const { slug } = req.params;
    
    console.log(`[StoreAPI routeStore.js line 228] Syncing Yelp data for store: ${slug}`);
    
    // Get existing store data
    const store = await StoreModel.findOne({ slug });
    
    if (!store) {
      return res.status(404).json({ 
        success: false, 
        error: 'Store not found' 
      });
    }
    
    // Prepare store params for Yelp API
    const storeParams = {
      storeName: store.hero?.storeName || store.title,
      storeCity: store.hero?.city || store.location?.neighborhood?.city,
      storeState: store.hero?.state || store.location?.neighborhood?.state,
      storeLongitude: store.location?.neighborhood?.geolocation?.lon,
      storeLatitude: store.location?.neighborhood?.geolocation?.lat,
      storeAddress: store.location?.neighborhood?.address,
      yelpId: store.yelpId,
      slug: store.slug
    };
    
    console.log(`[StoreAPI routeStore.js line 252] Fetching Yelp data with params:`, storeParams);
    
    // Fetch all Yelp data
    const [
      yelpData,
      yelpFoodData,
      yelpFusionData,
      yelpSearchData,
      yelpPhoneData,
      yelpMatchData,
      yelpDetailsData,
      yelpDeliveryData,
      yelpServiceData,
      yelpInsightData
    ] = await Promise.all([
      Yelp.getStoreData(storeParams),
      Yelp.getFoodData(storeParams),
      Yelp.getFusionData(storeParams),
      Yelp.getSearchData(storeParams),
      Yelp.getPhoneSearchData(storeParams),
      Yelp.getBusinessMatchData(storeParams),
      Yelp.getBusinessDetailsData(storeParams),
      Yelp.getFoodDeliverySearchData(storeParams),
      Yelp.getServiceOfferingsData(storeParams),
      Yelp.getBusinessInsightsData(storeParams)
    ]);
    
    console.log(`[StoreAPI routeStore.js line 278] Yelp data fetched successfully`);
    
    // Update store with Yelp data
    const updatedStore = await StoreModel.findOneAndUpdate(
      { slug },
      {
        $set: {
          yelpData,
          yelpFoodData,
          yelpFusionData,
          yelpSearchData,
          yelpPhoneData,
          yelpMatchData,
          yelpDetailsData,
          yelpDeliveryData,
          yelpServiceData,
          yelpInsightData,
          'business.timeline': yelpData, // Update business timeline with Yelp data
          lastYelpSync: new Date()
        }
      },
      { new: true }
    );
    
    console.log(`[StoreAPI routeStore.js line 301] Store updated with Yelp data: ${updatedStore.title}`);
    
    res.json({
      success: true,
      message: 'Yelp data synced successfully',
      store: {
        id: updatedStore._id,
        slug: updatedStore.slug,
        title: updatedStore.title
      }
    });
    
  } catch (error) {
    console.error(`[StoreAPI routeStore.js line 315] Error syncing Yelp data:`, error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to sync Yelp data: ' + error.message 
    });
  }
});

// RECORD STORE VISIT
routeStore.post('/stores/:slug/visit', authenticateToken, async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }
    
    console.log(`[StoreAPI routeStore.js line 336] Recording visit for store: ${slug} by user: ${userId}`);
    
    const store = await StoreModel.findOne({ slug });
    
    if (!store) {
      return res.status(404).json({ 
        success: false, 
        error: 'Store not found' 
      });
    }
    
    // Update user's visit history
    await UserModel.findByIdAndUpdate(userId, {
      $push: {
        visitHistory: {
          storeId: slug,
          timestamp: new Date()
        }
      }
    });
    
    console.log(`[StoreAPI routeStore.js line 357] Visit recorded for store: ${store.hero?.storeName || store.slug}`);
    
    res.json({ 
      success: true, 
      message: 'Visit recorded successfully' 
    });
    
  } catch (error) {
    console.error('[StoreAPI routeStore.js line 365] Error recording visit:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to record visit' 
    });
  }
});

// CHECK-IN/CHECK-OUT ENDPOINT
routeStore.post('/store/checkin', authenticateToken, async (req, res) => {
  try {
    const { storeId, action } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }
    
    console.log(`[StoreAPI routeStore.js line 386] Check-in request: ${action} for store ${storeId} by user ${userId}`);
    
    const store = await StoreModel.findOne({ slug: storeId });
    
    if (!store) {
      return res.status(404).json({ 
        success: false, 
        message: 'Store not found' 
      });
    }
    
    // Handle check-in/check-out logic
    if (action === 'checkin') {
      // Check if user is already checked in somewhere else
      const existingCheckIn = await UserModel.findById(userId).select('checkedInStore');
      if (existingCheckIn.checkedInStore && existingCheckIn.checkedInStore !== storeId) {
        // Check out from previous store
        await StoreModel.findOneAndUpdate(
          { slug: existingCheckIn.checkedInStore },
          {
            $pull: { 'interactions.checkedInBy': { user: userId } }
          }
        );
      }
      
      // Check in to new store
      if (!store.interactions.checkedInBy.find(c => c.user.toString() === userId)) {
        store.interactions.checkedInBy.push({ user: userId });
        store.interactions.checkins++;
      }
      
      // Update user's current check-in
      await UserModel.findByIdAndUpdate(userId, {
        checkedInStore: storeId,
        $push: {
          checkedInStores: {
            storeId: storeId,
            checkedInAt: new Date()
          }
        }
      });
      
    } else if (action === 'checkout') {
      // Remove from checkedInBy
      store.interactions.checkedInBy = store.interactions.checkedInBy.filter(
        c => c.user.toString() !== userId
      );
      
      // Clear user's current check-in
      await UserModel.findByIdAndUpdate(userId, {
        checkedInStore: null
      });
    }
    
    await store.save();
    
    console.log(`[StoreAPI routeStore.js line 440] Check-in action completed: ${action}`);
    
    res.json({
      success: true,
      message: `Successfully ${action === 'checkin' ? 'checked in to' : 'checked out from'} store`,
      checkins: store.interactions.checkins
    });
    
  } catch (error) {
    console.error('[StoreAPI routeStore.js line 449] Check-in error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// STORE IMPRESSION (LIKE/DISLIKE)
routeStore.post('/store/impression', authenticateToken, async (req, res) => {
  try {
    const { storeId, action, section } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }
    
    console.log(`[StoreAPI routeStore.js line 470] Impression request: ${action} for store ${storeId} section ${section} by user ${userId}`);
    
    const store = await StoreModel.findOne({ slug: storeId });
    
    if (!store) {
      return res.status(404).json({ 
        success: false, 
        message: 'Store not found' 
      });
    }
    
    // Check if user is checked in
    const isCheckedIn = store.interactions.checkedInBy.some(
      c => c.user.toString() === userId
    );
    
    if (!isCheckedIn) {
      return res.status(403).json({
        success: false,
        message: 'You must be checked in to this store to like or dislike'
      });
    }
    
    // Handle the interaction
    const result = await store.handleInteraction(userId, action, section || 'general');
    
    console.log(`[StoreAPI routeStore.js line 496] Impression recorded: ${action}`);
    
    res.json({
      success: true,
      ...result
    });
    
  } catch (error) {
    console.error('[StoreAPI routeStore.js line 504] Impression error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET CHECK-IN STATUS
routeStore.get('/store/checkin/status', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }
    
    console.log(`[StoreAPI routeStore.js line 524] Getting check-in status for user: ${userId}`);
    
    // Get user's current check-in
    const user = await UserModel.findById(userId).select('checkedInStore');
    
    res.json({
      success: true,
      checkedInStore: user?.checkedInStore || null
    });
    
  } catch (error) {
    console.error('[StoreAPI routeStore.js line 535] Check-in status error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET USER IMPRESSIONS FOR A STORE
routeStore.get('/user/impressions/:storeId', authenticateToken, async (req, res) => {
  try {
    const { storeId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
    }
    
    console.log(`[StoreAPI routeStore.js line 556] Getting user impressions for store: ${storeId}`);
    
    const store = await StoreModel.findOne({ slug: storeId });
    
    if (!store) {
      return res.status(404).json({ 
        success: false, 
        message: 'Store not found' 
      });
    }
    
    const hasLiked = store.interactions.likedBy.includes(userId);
    const hasDisliked = store.interactions.dislikedBy.includes(userId);
    
    res.json({
      success: true,
      hasLiked,
      hasDisliked,
      likes: store.interactions.likes,
      dislikes: store.interactions.dislikes
    });
    
  } catch (error) {
    console.error('[StoreAPI routeStore.js line 579] User impressions error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET STORES LIST WITH FILTERS
routeStore.get('/stores', async (req, res) => {
  try {
    const {
      category,
      city,
      state,
      limit = 12,
      page = 1,
      sort = 'popular'
    } = req.query;
    
    console.log('[StoreAPI routeStore.js line 598] Getting stores list with filters:', req.query);
    
    // Build query
    const query = {};
    
    if (category) {
      query['hero.storeType.alias'] = category;
    }
    
    if (city) {
      query['hero.city'] = new RegExp(city, 'i');
    }
    
    if (state) {
      query['hero.state'] = state.toUpperCase();
    }
    
    // Build sort
    let sortQuery = {};
    switch (sort) {
      case 'rating':
        sortQuery = { 'hero.rating': -1 };
        break;
      case 'newest':
        sortQuery = { createdAt: -1 };
        break;
      case 'popular':
      default:
        sortQuery = { 'interactions.views': -1 };
        break;
    }
    
    // Calculate pagination
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const skip = (pageNum - 1) * limitNum;
    
    // Get total count
    const totalStores = await StoreModel.countDocuments(query);
    const totalPages = Math.ceil(totalStores / limitNum);
    
    // Fetch stores
    const stores = await StoreModel.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum)
      .select('slug title hero location media interactions')
      .lean();
    
    console.log(`[StoreAPI routeStore.js line 648] Found ${stores.length} stores`);
    
    res.json({
      success: true,
      stores,
      totalPages,
      currentPage: pageNum,
      totalStores,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalStores,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
    
  } catch (error) {
    console.error('[StoreAPI routeStore.js line 667] Error fetching stores:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stores',
      error: error.message
    });
  }
});

// SEARCH STORES
routeStore.get('/stores/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ stores: [] });
    }
    
    console.log(`[StoreAPI routeStore.js line 684] Searching stores for: ${q}`);
    
    // Search stores by name, address, or city
    const stores = await StoreModel.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { 'hero.storeName': { $regex: q, $options: 'i' } },
        { 'location.neighborhood.address': { $regex: q, $options: 'i' } },
        { 'hero.city': { $regex: q, $options: 'i' } }
      ]
    })
    .limit(10)
    .select('slug title hero location')
    .lean();
    
    console.log(`[StoreAPI routeStore.js line 699] Found ${stores.length} stores matching search`);
    
    res.json({
      success: true,
      stores: stores.map(store => ({
        _id: store._id,
        slug: store.slug,
        title: store.hero?.storeName || store.title,
        address: store.location?.neighborhood?.address || '',
        city: store.hero?.city || '',
        state: store.hero?.state || ''
      }))
    });
    
  } catch (error) {
    console.error('[StoreAPI routeStore.js line 714] Error searching stores:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error searching stores' 
    });
  }
});

// GET STORES FOR MAP (GEOJSON FORMAT)
routeStore.get('/geojson/stores', async (req, res) => {
  try {
    console.log('[StoreAPI routeStore.js line 725] Getting GeoJSON stores data');
    
    const stores = await StoreModel.find({})
      .select('slug title hero location category media interactions')
      .limit(100)
      .sort({ 'interactions.views': -1 })
      .lean()
      .maxTimeMS(10000);
    
    // Convert to GeoJSON format
    const features = stores.map(store => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [
          store.location?.neighborhood?.geolocation?.lon || -118.2437,
          store.location?.neighborhood?.geolocation?.lat || 34.0522
        ]
      },
      properties: {
        id: store._id.toString(),
        slug: store.slug,
        title: store.hero?.storeName || store.title || 'Unknown Store',
        variant: 'stores',
        categoryType: store.hero?.storeType?.[0]?.alias || 'coffee',
        address: store.location?.neighborhood?.address || '',
        city: store.hero?.city || '',
        state: store.hero?.state || '',
        thumbnail: store.hero?.gallery?.[0] || '',
        rating: store.hero?.rating || 0,
        price: store.hero?.price || '$$',
        views: store.interactions?.views || 0,
        likes: store.interactions?.likes || 0
      }
    }));
    
    const geojsonData = {
      type: 'FeatureCollection',
      features: features
    };
    
    console.log(`[StoreAPI routeStore.js line 766] Returning ${features.length} store features`);
    
    res.json(geojsonData);
    
  } catch (error) {
    console.error('[StoreAPI routeStore.js line 771] Error getting GeoJSON stores:', error);
    res.status(500).json({ 
      type: 'FeatureCollection',
      features: []
    });
  }
});

export default routeStore;
///////////////////////// END COMPLETE ROUTESTORE.JS /////////////////////////
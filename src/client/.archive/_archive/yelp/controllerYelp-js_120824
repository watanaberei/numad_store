import YelpService from '../services/yelpService.js';


export const getBusinessDetails = async (req, res) => {
 try {
   const { businessId } = req.params;
   const data = await YelpService.getBusinessDetails(businessId);
   res.json(data);
 } catch (error) {
   console.error('Controller error:', error);
   res.status(500).json({ error: error.message });
 }
};


export const searchBusinesses = async (req, res) => {
 try {
   const searchParams = {
     term: req.query.term || 'coffee',
     location: req.query.location || 'San Francisco',
     limit: req.query.limit || 20,
     sort_by: req.query.sort_by || 'rating',
     radius: req.query.radius || 8000 // 5 miles in meters
   };


   const results = await YelpService.searchBusinesses(searchParams);
   res.json(results);
 } catch (error) {
   console.error('Search error:', error);
   res.status(500).json({ error: error.message });
 }
};

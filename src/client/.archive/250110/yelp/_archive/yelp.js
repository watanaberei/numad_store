
//'./src/server/data/yelp/yelp.js'

'use strict';
class YelpClient {
    constructor(apiKey, options){
        this.apiKey = apiKey;
        this.options = {};
        
        if(typeof options !== 'undefined'){
            this.options = options;
        }
    }
    
    send(requestOptions){
        const combinedOptions = Object.assign({}, requestOptions, this.options);
        // Implement the send function logic here
    };

  // BUSINESS ENDPOINTS

  search(parameters){
    return this.send({
      url: 'https://api.yelp.com/v3/businesses/search',
      query: parameters,
      bearerToken: this.apiKey
    });
  }

  phoneSearch(parameters){
    return this.send({
      url: 'https://api.yelp.com/v3/businesses/search/phone',
      query: parameters,
      bearerToken: this.apiKey
    });
  }

  transactionSearch(transactionType, parameters){
    return this.send({
      url: 'https://api.yelp.com/v3/transactions/{transaction_type}/search',
      urlParams:{
        transaction_type: transactionType
      },
      query: parameters,
      bearerToken: this.apiKey
    });
  }

  business(id){
    return this.send({
      url: 'https://api.yelp.com/v3/businesses/{id}',
      urlParams:{
        id: id
      },
      bearerToken: this.apiKey
    });
  }

  reviews(businessId){
    return this.send({
      url: 'https://api.yelp.com/v3/businesses/{id}/reviews',
      urlParams:{
        id: businessId
      },
      bearerToken: this.apiKey
    });
  }

  autocomplete(parameters){
    return this.send({
      url: 'https://api.yelp.com/v3/autocomplete',
      query: parameters,
      bearerToken: this.apiKey
    });
  }

  businessMatch(parameters){
    return this.send({
      url: 'https://api.yelp.com/v3/businesses/matches',
      query: parameters,
      bearerToken: this.apiKey
    });
  }

  // EVENTS ENDPOINTS

  eventLookup(eventId, parameters){
    return this.send({
      url: 'https://api.yelp.com/v3/events/{id}',
      urlParams:{
        id: eventId
      },
      query:parameters,
      bearerToken: this.apiKey
    });
  }

  eventSearch(parameters){
    return this.send({
      url: 'https://api.yelp.com/v3/events',
      query: parameters,
      bearerToken: this.apiKey
    });
  }

  featuredEvent(parameters){
    return this.send({
      url: 'https://api.yelp.com/v3/events/featured',
      query: parameters,
      bearerToken: this.apiKey
    });
  }

  // CATEGORIES ENDPOINTS

  allCategories(){
    return this.send({
      url: 'https://api.yelp.com/v3/categories',
      bearerToken: this.apiKey
    });
  }

  categoryDetails(alias){
    return this.send({
      url: 'https://api.yelp.com/v3/categories/{alias}',
      urlParams:{
        alias: alias
      },
      bearerToken: this.apiKey
    });
  }
}

const createClient = (apiKey, options) => {
  return new YelpClient(apiKey, options);
};

module.exports = {
  client: createClient
};

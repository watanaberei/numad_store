//   src/server/data/index.js

import * as mongodb from './mongodb/mongodb';
import * as contentful from './contentful';
import * as yelp from './yelp';
import * as otherApi from './other-api';

export { mongodb, contentful, yelp, otherApi };
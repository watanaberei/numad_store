//   src/server/data/index.js

import * as mongodb from './mongodb/mongodb';
import * as contentful from './contentful/contenful';
import * as yelp from './yelp/yelp';
import * as otherApi from './other-api';

export { mongodb, contentful, yelp, otherApi };
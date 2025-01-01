////////////////////////////////// API //////////////////////////////////
// MAPBOX
import mapRoute from "./mapRoute.js";
import polyline from "@mapbox/polyline";
import mapboxgl from "mapbox-gl";
import { initMap } from "./MapApi.js";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { Style2DPrimary, StyleSatellitePrimary } from "./MapStyles.js";
import * as turf from "@turf/turf";
import GeopostReviews from "./GeopostReviews.js";
// CONTENTFUL
import { getStoresNeumadsReview, getArticleNeumadsTrail, getArticlePost, getStore } from "../api.js";
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
// YELP
import YelpReviews from "./YelpReviews.js";
import { YelpApi } from "./YelpApi.js"; 
// TIME
import fetchDateTime from "./timeApi.js";
// WEATHER
import { processGroupedItems } from "./processGroupedItems.js";
import { getWeather } from "./weatherApi.js";
// import "./weatherReport";

////////////////////////////////// HOME //////////////////////////////////
// DINESCREEN COMPONENTS
import { geojsonStore } from "./GeojsonStores.js";
import AllBlog from "./AllBlog.js";
import DineScreen from "../screens/DineScreen.js";

////////////////////////////////// RENDERING //////////////////////////////////
// RENDER COMPONENTS
import { parseRequestUrl } from "../utils.js";
import { format, parseISO } from "date-fns";

////////////////////////////////// CARD //////////////////////////////////
import createArticleCard from "./card-article.js";
import createBlogCard from "./card-blog.js";
import createDefaultCard from "./card-default.js";
import createReviewCard from "./card-review.js";
import createStoreCard from "./card-store.js";
import { createMapMarker } from "./MapMarker.js";
import { createGeojsonListing } from "./GeojsonListing.js";
import { createGeojsonStoreListing } from "./GeojsonStoreListing.js";
import { createGeojsonReviewListing } from "./GeojsonReviewListing.js";
import { createGeojsonArticleListing } from "./GeojsonArticleListing.js";
import { createGeojsonBlogListing } from "./GeojsonBlogListing.js";
import { createGeocoderInput } from "./GeocoderInput.js";
// STRUCTURAL COMPONENTS
import { getParentDivForVariant } from "./listingVariant.js";
// OLD COMPONENTS
import DataBlog from "./DataPost.js";
import DinePost from "./DineBlog.js";
import DineFeaturedBlog from "./DineFeaturedBlog.js";
import FeaturedBlog from "./FeaturedBlog.js";
import Blog from "./Blog.js";
import ArticlePost from "./NonFeaturedBlog.js";
// OLD BLOG COMPONENTS
import PrimaryFeaturedBlog from "./PrimaryFeaturedBlog.js";
import ShortsBlog from "./ShortsBlog.js";
import ShortsFeaturedBlog from "./ShortsFeaturedBlog.js";
import UnwindBlog from "./UnwindBlog.js";
import UnwindFeaturedBlog from "./UnwindFeaturedBlog.js";
import WorkBlog from "./WorkBlog.js";
import WorkFeaturedBlog from "./WorkFeaturedBlog.js";

////////////////////////////////// STORE //////////////////////////////////
import { storePopularTimes } from "./StorePopularTimes.js";

////////////////////////////////// GLOBAL //////////////////////////////////
// import Advertisement from "./Advertisement";
import GridOverlay from "./gridOverlay.js";

////////////////////////////////// DATA //////////////////////////////////
// import AllStore from "./AllStore";
// import ArticleNeumadsTrail from "./ArticleNeumadsTrail";


////////////////////////////////// CONTROL //////////////////////////////////
import { userControl } from "./UserControls.js";


////////////////////////////////// SEARCH //////////////////////////////////
import DataFilter from "./DataFilter.js";
import Search from "./Search.js";
import SearchFunction from "./SearchFunction.js";
import SearchResultsCategory from "./SearchResultsCategory.js";
import SearchResultsLocation from "./SearchResultsLocation.js";
import allTags from "./DataTags.js";

// import "../../bundle.js";

export { 
    mapRoute,
    polyline,
    mapboxgl,
    initMap,
    MapboxGeocoder,
    Style2DPrimary,
    StyleSatellitePrimary,
    turf,
    GeopostReviews,
    getStoresNeumadsReview,
    getArticleNeumadsTrail,
    getArticlePost,
    getStore,
    documentToHtmlString,
    BLOCKS,
    INLINES,
    YelpReviews,
    YelpApi,
    fetchDateTime,
    processGroupedItems,
    getWeather,
    geojsonStore,
    AllBlog,
    DineScreen,
    parseRequestUrl,
    format,
    parseISO,
    createArticleCard,
    createBlogCard,
    createDefaultCard,
    createReviewCard,
    createStoreCard,
    createMapMarker,
    createGeojsonListing,
    createGeojsonStoreListing,
    createGeojsonReviewListing,
    createGeojsonArticleListing,
    createGeojsonBlogListing,
    createGeocoderInput,
    getParentDivForVariant,
    DataBlog,
    DinePost,
    DineFeaturedBlog,
    FeaturedBlog,
    Blog,
    ArticlePost,
    PrimaryFeaturedBlog,
    ShortsBlog,
    ShortsFeaturedBlog,
    UnwindBlog,
    UnwindFeaturedBlog,
    WorkBlog,
    WorkFeaturedBlog,
    storePopularTimes,
    GridOverlay,
    // AllStore,
    // ArticleNeumadsTrail,
    DataFilter,
    Search,
    SearchFunction,
    SearchResultsCategory,
    SearchResultsLocation,
    userControl,
    allTags
 }
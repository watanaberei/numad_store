// routes/mainRoutes.js
import { getArticleNeumadsTrail } from "../../client/api.js";
import "../../client/components/Style.js";   
import * as Components from '../../client/components/Components.js';
import HeaderSecondary from "../../client/components/HeaderSecondary.js";
import HeaderArticle from "../../client/components/HeaderArticle.js";
import HeaderStore from "../../client/components/HeaderStore.js";
import HeaderReview from "../../client/components/HeaderReview.js";
import HeaderWork from "../../client/components/HeaderWork.js";
import HeaderHome from "../../client/components/HeaderHome.js";
import HeaderUnwind from "../../client/components/HeaderUnwind.js";
import HeaderShorts from "../../client/components/HeaderShorts.js";
import HeaderSeries from "../../client/components/HeaderSeries.js";
import HeaderDine from "../../client/components/HeaderDine.js";
import HeaderMap from "../../client/components/HeaderMap.js";
import HeaderReviews from "../../client/components/HeaderReviews.js";
import HomeScreen from "../../client/screens/HomeScreen.js";
import WorkScreen from "../../client/screens/WorkScreen.js";
import UnwindScreen from "../../client/screens/UnwindScreen.js";
import DineScreen from "../../client/screens/DineScreen.js";
import SignupScreen from "../../client/screens/SignupScreen.js";
import LoginScreen from "../../client/screens/LoginScreen.js";
import BlogScreen from "../../client/screens/BlogScreen.js";
import ArticleScreen from "../../client/screens/ArticleScreen.js";
import StoreScreen from "../../client/screens/StoreScreen.js";
import ShortsScreen from "../../client/screens/ShortsScreen.js";
import SeriesScreen from "../../client/screens/SeriesScreen.js";
import AboutScreen from "../../client/screens/AboutScreen.js";
import ContactScreen from "../../client/screens/ContactScreen.js";
import MapScreen from "../../client/screens/MapScreen.js";
import ReviewScreen from "../../client/screens/ReviewScreen.js";
import Error404Page from "../../client/screens/Error404Page.js";
import { parseRequestUrl, showLoading, hideLoading } from "../../client/utils.js";
import { createAuth0Client } from '@auth0/auth0-spa-js';
// import "./mongodb.js";
// import "./setupProxy.js";

/// Enable CORS
const routes = {
  "/": HomeScreen,
  "/work": WorkScreen,
  "/unwind": UnwindScreen,
  "/dine": DineScreen,
  "/signup": SignupScreen,
  "/login": LoginScreen,
  "/shorts": ShortsScreen,
  "/blogs/:slug": BlogScreen,
  "/stores/:slug": StoreScreen,
  "/articles/:slug": ArticleScreen,
  "/reviews/:slug": ReviewScreen,
  "/about": AboutScreen,
  "/contact": ContactScreen,
  "/map": MapScreen,
};




// Update the router function to use the window's pathname
const router = async () => {
  const request = parseRequestUrl(window.location.pathname); // Use the pathname without hash
  const path = request.resource || '/';
  const parseUrl =
    (request.resource ? `/${request.resource}` : "/") +
    (request.slug ? "/:slug" : "") +
    (request.verb ? `/${request.verb}` : "");
  const screen = routes[parseUrl] ? routes[parseUrl] : Error404Page;
  const header = document.getElementById("header");
  if (parseUrl === "/work") {
    header.innerHTML = await HeaderHome.render();
    await HeaderHome.after_render();
  } else if (parseUrl === "/blogs/:slug") {
    header.innerHTML = await HeaderSecondary.render();
    await HeaderSecondary.after_render();
  } else if (parseUrl === "/stores/:slug") {
    header.innerHTML = await HeaderHome.render();
    await HeaderHome.after_render();
  } else if (parseUrl === "/reviews/:slug") {
    header.innerHTML = await HeaderHome.render();
    await HeaderHome.after_render();
  } else if (parseUrl === "/articles/:slug") {
    header.innerHTML = await HeaderHome.render();
    await HeaderHome.after_render();
  } else if (parseUrl === "/unwind") {
    header.innerHTML = await HeaderHome.render();
    await HeaderHome.after_render();
  } else if (parseUrl === "/dine") {
    header.innerHTML = await HeaderHome.render();
    await HeaderHome.after_render();
  } else if (parseUrl === "/shorts") {
    header.innerHTML = await HeaderHome.render();
    await HeaderHome.after_render();
  // } else if (parseUrl === "/signup") {
  //   header.innerHTML = await HeaderSecondary.render();
  //   await HeaderSecondary.after_render();
  // } else if (parseUrl === "/login") {
  //   header.innerHTML = await HeaderSecondary.render();
  //   await HeaderSecondary.after_render();
  } else if (parseUrl === "/map") {
    header.innerHTML = await HeaderHome.render();
    await HeaderHome.after_render();
  } else {
    header.innerHTML = await HeaderHome.render();
    await HeaderHome.after_render();
  }
// Catch errors since some browsers throw when using the new `type` option.
// https://bugs.webkit.org/show_bug.cgi?id=209216
try {
  // Mark the start of some operation
  performance.mark('startOperation');

  const main = document.getElementById("content");
  main.innerHTML = await screen.render();
  if (screen.after_render) await screen.after_render();

  // Mark the end of the operation
  performance.mark('endOperation');

  // Measure the duration of the operation
  performance.measure('operation', 'startOperation', 'endOperation');

  const po = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      // Log the entry and all associated details.
      console.log(entry.toJSON());
    }
  });

  // Observe the 'measure' entries
  po.observe({type: 'measure'});
} catch (e) {
    // Do nothing if the browser doesn't support this API.
  }
  const main = document.getElementById("content");
  main.innerHTML = await screen.render();
  if (screen.after_render) await screen.after_render();

};
// The load event listener has been removed
document.addEventListener('DOMContentLoaded', () => {
  router();
  window.addEventListener('popstate', router);
});

window.addEventListener('popstate', router);
document.addEventListener('DOMContentLoaded', () => {
  document.body.addEventListener('click', e => {
    if (e.target.matches('[data-link]')) {
      e.preventDefault();
      history.pushState(null, null, e.target.href);
      router();
    }
  });
  router();
});

// The load event listener has been removed
document.addEventListener('DOMContentLoaded', router);
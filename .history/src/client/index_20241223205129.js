// src/index.js
// import { getArticleNeumadsTrail } from "./api.js";
import "./styles/style.js";   
import './components/components.js';
import HeaderHome from "./components/header/HeaderHome.js";
import StoreScreen from "./screens/StoreScreen.js";
import { parseRequestUrl } from "./utils.js";

const routes = {
  "/": HomeScreen,
  "/stores/:slug": StoreScreen,
};

const router = async () => {
  const request = parseRequestUrl();
  const parseUrl =
    (request.resource ? `/${request.resource}` : "/") +
    (request.slug ? "/:slug" : "") +
    (request.verb ? `/${request.verb}` : "");
    
  const screen = routes[parseUrl] || Error404Page;
  const header = document.getElementById("header");
  const main = document.getElementById("content");

  try {
    performance.mark('startOperation');
    
    // Render header
    header.innerHTML = await HeaderHome.render();
    await HeaderHome.after_render();

    // Render main content
    main.innerHTML = await screen.render();
    if (screen.after_render) await screen.after_render();

    performance.mark('endOperation');
    performance.measure('operation', 'startOperation', 'endOperation');
  } catch (error) {
    console.error('Router error:', error);
  }
};

// Event Listeners
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
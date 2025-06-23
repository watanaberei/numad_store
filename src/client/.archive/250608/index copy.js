// src/client/index.js
import "./styles/style.js";   
import './components/components.js';
import HeaderHome from "./components/header/HeaderHome.js";
import StoreScreen from "./screens/Store/StoreScreen.js";
import StoreListScreen from "./screens/Store/StoreListScreen.js"
import HomeScreen from "./screens/Home/HomeScreen.js";
import HeaderSecondary from "./components/header/HeaderSecondary.js";
import HeaderMicro from "./components/header/HeaderMicro.js";
import SignupScreen from "./screens/Auth/SignupScreen.js";
import LoginScreen from "./screens/Auth/LoginScreen.js";
import AuthScreen from "./screens/Auth/AuthScreen.js";
import UserScreen from "./screens/User/UserScreen.js";
import ProfileScreen from "./screens/User/ProfileScreen.js";
import SettingScreen from "./screens/User/SettingScreen.js";
// import MapScreen from "./screens/MapScreen.js";
import PostScreen from "./screens/Blog/BlogCmsScreen.js";        // Add blog CMS
import BlogScreen from "./screens/Blog/BlogScreen.js";        // Add blog view
import BlogListScreen from "./screens/Blog/BlogListScreen.js"; // Add blog list
import Error404Page from "./screens/Error/Error404Page.js";
import { parseRequestUrl, showLoading, hideLoading } from './utils/utils.js';
// Import the new modal auth system
import { modals, auth } from './components/modal/modal.js';

// Logging utility
const routerLog = (action, data = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`[ROUTER ${timestamp}] ${action}`, data);
};

///////////////////////// START NEW ROUTING STRUCTURE /////////////////////////

// Helper function to parse @username routes
const parseUsername = (path) => {
  const match = path.match(/^\/@([^\/]+)/);
  return match ? match[1] : null;
};

// Client-side routes for SPA navigation
const routes = {
  "/": HomeScreen,
  "/signup": SignupScreen,
  "/login": LoginScreen,
  "/Auth": AuthScreen,
  "/blogs": BlogListScreen,
  "/stores": StoreListScreen,
  "/post": PostScreen,
  "/@:username": UserScreen,
  "/@:username/setting": SettingScreen,
  "/@:username/:blog": BlogScreen,
  "/@:username/:blog/edit": PostScreen,
  "/:store": StoreScreen,
};

// Override screens that should open modals instead
const modalRoutes = {
  "/signup": () => {
    routerLog('Signup route accessed, opening auth modal');
    auth.openAuthModal('signup');
    window.history.pushState({}, '', '/');
    return HomeScreen;
  },
  "/login": () => {
    routerLog('Login route accessed, opening auth modal');
    auth.openAuthModal('login');
    window.history.pushState({}, '', '/');
    return HomeScreen;
  }
};

// Update the router function to use the window's pathname
const router = async () => {
  const pathname = window.location.pathname;
  const pathParts = pathname.split('/').filter(Boolean);
  
  let parseUrl = '/';
  let request = {};
  
  routerLog('Routing', { pathname, pathParts });
  
  // Handle home route
  if (pathParts.length === 0) {
    parseUrl = '/';
  }
  // Handle @username routes
  else if (pathParts[0] && pathParts[0].startsWith('@')) {
    const username = pathParts[0].substring(1); // Remove @ symbol
    request.username = username;
    
    if (pathParts.length === 1) {
      // /@username
      parseUrl = '/@:username';
      request.resource = username;
    } else if (pathParts[1] === 'setting') {
      // /@username/setting
      parseUrl = '/@:username/setting';
      request.resource = username;
      request.action = 'setting';
    } else if (pathParts.length === 2) {
      // /@username/:blog
      parseUrl = '/@:username/:blog';
      request.resource = username;
      request.slug = pathParts[1];
    } else if (pathParts.length === 3 && pathParts[2] === 'edit') {
      // /@username/:blog/edit
      parseUrl = '/@:username/:blog/edit';
      request.resource = username;
      request.slug = pathParts[1];
      request.action = 'edit';
    }
  }
  // Handle static routes
  else if (['blogs', 'stores', 'post', 'signup', 'login', 'Auth'].includes(pathParts[0])) {
    parseUrl = `/${pathParts[0]}`;
    request.resource = pathParts[0];
  }
  // Handle store routes (anything else with one segment)
  else if (pathParts.length === 1) {
    parseUrl = '/:store';
    request.slug = pathParts[0];
  }
  
  routerLog('Parsed route', { parseUrl, request });
  
  // Check if this route should open a modal instead
  if (modalRoutes[parseUrl]) {
    const screen = modalRoutes[parseUrl]();
    const header = document.getElementById("header");
    header.innerHTML = await HeaderHome.render();
    await HeaderHome.after_render();
    
    const main = document.getElementById("content");
    main.innerHTML = await screen.render();
    if (screen.after_render) await screen.after_render();
    return;
  }


  // Check if route requires authentication
  const authRequiredRoutes = ['/@:username/setting', '/post', '/@:username/:blog/edit'];
  if (authRequiredRoutes.includes(parseUrl) && !auth.isAuthenticated()) {
    routerLog('Route requires authentication, redirecting to login');
    auth.openAuthModal('login');
    window.history.pushState({}, '', '/');
    parseUrl = '/';
  }
  
  const screen = routes[parseUrl] ? routes[parseUrl] : Error404Page;
  const header = document.getElementById("header");
  
  // Determine which header to use based on route
  header.innerHTML = await HeaderHome.render();
  await HeaderHome.after_render();

  // Performance monitoring
  try {
    performance.mark('startOperation');

    const main = document.getElementById("content");
    
    // Pass request data to screens that need it
    if (screen === UserScreen || screen === SettingScreen || screen === BlogScreen || 
        (screen === PostScreen && parseUrl === '/@:username/:blog/edit')) {
      screen.request = request;
    }
    
    main.innerHTML = await screen.render();
    if (screen.after_render) await screen.after_render();

    performance.mark('endOperation');
    performance.measure('operation', 'startOperation', 'endOperation');

    const po = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log(entry.toJSON());
      }
    });

    po.observe({type: 'measure'});
  } catch (e) {
    // Fallback for browsers that don't support performance API
    const main = document.getElementById("content");
    
    // Pass request data to screens that need it
    if (screen === UserScreen || screen === SettingScreen || screen === BlogScreen || 
        (screen === PostScreen && parseUrl === '/@:username/:blog/edit')) {
      screen.request = request;
    }
    
    main.innerHTML = await screen.render();
    if (screen.after_render) await screen.after_render();
  }
};

///////////////////////// END NEW ROUTING STRUCTURE /////////////////////////

// Initialize modal system when DOM is ready
const initializeApp = () => {
  routerLog('Initializing application');
  
  // Initialize modal system
  modals.init();
  
  // Check authentication state
  auth.checkState();
  
  // Listen for authentication state changes
  window.addEventListener('user-authenticated', (e) => {
    routerLog('User authenticated', { user: e.detail.user });
    // Optionally refresh the current route to update UI
    router();
  });
  
  window.addEventListener('user-unauthenticated', () => {
    routerLog('User unauthenticated');
    // Optionally refresh the current route to update UI
    router();
  });
  
  // Initial routing
  router();
};

// Event listeners for SPA navigation
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
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

// Handle navigation link clicks
document.body.addEventListener('click', e => {
  // Handle both data-link and regular anchor tags within the app
  const link = e.target.closest('[data-link], a');
  if (link && link.href && link.host === window.location.host) {
    // Skip external links
    if (link.target === '_blank') return;
    
    e.preventDefault();
    const path = link.pathname;
    routerLog('Navigation link clicked', { path });
    
    // Special handling for auth links
    if (path === '/login') {
      auth.openAuthModal('login');
      return;
    }
    if (path === '/signup') {
      auth.openAuthModal('signup');
      return;
    }
    
    history.pushState(null, null, path);
    router();
  }
});

// Export router for use in other modules
export { router };

// Handle logout links
document.addEventListener('click', (e) => {
  if (e.target.matches('[data-logout]')) {
    e.preventDefault();
    routerLog('Logout requested');
    auth.logout();
  }
});
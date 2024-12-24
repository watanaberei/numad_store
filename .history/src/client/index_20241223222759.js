// src/index.js
// import { getArticleNeumadsTrail } from "./api.js";
import "./styles/style.js";   
import './components/components.js';
import HeaderHome from "./components/header/HeaderHome.js";
import StoreScreen from "./screens/StoreScreen.js";
import HomeScreen from "./screens/HomeScreen.js";
import HeaderSecondary from "./components/header/HeaderSecondary.js";
import HeaderMicro from "./components/header/HeaderMicro.js";
import SignupScreen from "./screens/SignupScreen.js";
import LoginScreen from "./screens/LoginScreen.js";
import AuthScreen from "./screens/AuthScreen.js";
import UserScreen from "./screens/UserScreen.js";
import ProfileScreen from "./screens/ProfileScreen.js";
import SettingScreen from "./screens/SettingScreen.js";
import MapScreen from "./screens/MapScreen.js";
import Error404Page from "./screens/Error404Page.js";
import { parseRequestUrl, showLoading, hideLoading } from "./utils.js";
const routes = {
  "/": HomeScreen,
  "/stores/:slug": StoreScreen,
};


/// Enable CORS
const routes = {
  "/": HomeScreen,
  "/signup": SignupScreen,
  "/login": LoginScreen,
  "/Auth": AuthScreen,
  "/user": UserScreen,
  "/settings": SettingScreen,
  "/profile": ProfileScreen, 
  "/stores/:slug": StoreScreen,
  "/map": MapScreen,
  // "/work": WorkScreen,
  // "/unwind": UnwindScreen,
  // "/dine": DineScreen,
  // "/shorts": ShortsScreen,
  // "/blogs/:slug": BlogScreen,
  // "/articles/:slug": ArticleScreen,
  // "/reviews/:slug": ReviewScreen,
  // "/about": AboutScreen,
  // "/contact": ContactScreen,
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
  } else if (parseUrl === "/signup") {
    header.innerHTML = await HeaderHome.render();
    await HeaderHome.after_render();
  } else if (parseUrl === "/login") {
    header.innerHTML = await HeaderHome.render();
    await HeaderHome.after_render();
  } else if (parseUrl === "/profile") {
    header.innerHTML = await HeaderHome.render();
    await HeaderHome.after_render();
  } else if (parseUrl === "/user") {
    header.innerHTML = await HeaderHome.render();
  } else if (parseUrl === "/setting") {
    header.innerHTML = await HeaderHome.render();
    await HeaderHome.after_render();
  } else if (parseUrl === "/auth") {
    header.innerHTML = await HeaderHome.render();
    await HeaderHome.after_render();
  } else if (parseUrl === "/stores/:slug") {
    header.innerHTML = await HeaderHome.render();
    await HeaderHome.after_render();
  } else if (parseUrl === "/map") {
    header.innerHTML = await HeaderHome.render();
    await HeaderHome.after_render();
  } else {
    header.innerHTML = await HeaderHome.render();
    await HeaderHome.after_render();
    // } else if (parseUrl === "/blogs/:slug") {
    //   header.innerHTML = await HeaderSecondary.render();
    //   await HeaderSecondary.after_render();
    // } else if (parseUrl === "/reviews/:slug") {
    //   header.innerHTML = await HeaderHome.render();
    //   await HeaderHome.after_render();
    // } else if (parseUrl === "/articles/:slug") {
    //   header.innerHTML = await HeaderHome.render();
    //   await HeaderHome.after_render();
    // } else if (parseUrl === "/unwind") {
    //   header.innerHTML = await HeaderHome.render();
    //   await HeaderHome.after_render();
    // } else if (parseUrl === "/dine") {
    //   header.innerHTML = await HeaderHome.render();
    //   await HeaderHome.after_render();
    // } else if (parseUrl === "/shorts") {
    //   header.innerHTML = await HeaderHome.render();
    //   await HeaderHome.after_render();
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




// const router = async () => {
//   const request = parseRequestUrl();
//   const parseUrl =
//     (request.resource ? `/${request.resource}` : "/") +
//     (request.slug ? "/:slug" : "") +
//     (request.verb ? `/${request.verb}` : "");
    
//   const screen = routes[parseUrl] || Error404Page;
//   const header = document.getElementById("header");
//   const main = document.getElementById("content");


//   if (parseUrl === "/work") {
//     header.innerHTML = await HeaderHome.render();
//     await HeaderHome.after_render();
//   } else if (parseUrl === "/signup") {
//     header.innerHTML = await HeaderHome.render();
//     await HeaderHome.after_render();
//   } else if (parseUrl === "/login") {
//     header.innerHTML = await HeaderHome.render();
//     await HeaderHome.after_render();
//   } else if (parseUrl === "/profile") {
//     header.innerHTML = await HeaderHome.render();
//     await HeaderHome.after_render();
//   } else if (parseUrl === "/user") {
//     header.innerHTML = await HeaderHome.render();
//   } else if (parseUrl === "/setting") {
//     header.innerHTML = await HeaderHome.render();
//     await HeaderHome.after_render();
//   } else if (parseUrl === "/auth") {
//     header.innerHTML = await HeaderHome.render();
//     await HeaderHome.after_render();
//   } else if (parseUrl === "/stores/:slug") {
//     header.innerHTML = await HeaderHome.render();
//     await HeaderHome.after_render();
//   } else if (parseUrl === "/map") {
//     header.innerHTML = await HeaderHome.render();
//     await HeaderHome.after_render();
//   } else {
//     header.innerHTML = await HeaderHome.render();
//     await HeaderHome.after_render();
//   }
// }

// // Catch errors since some browsers throw when using the new `type` option.
// // https://bugs.webkit.org/show_bug.cgi?id=209216
// try {
//   // Mark the start of some operation
//   performance.mark('startOperation');

//   const main = document.getElementById("content");
//   main.innerHTML = await screen.render();
//   if (screen.after_render) await screen.after_render();

//   // Mark the end of the operation
//   performance.mark('endOperation');

//   // Measure the duration of the operation
//   performance.measure('operation', 'startOperation', 'endOperation');

//   const po = new PerformanceObserver((list) => {
//     for (const entry of list.getEntries()) {
//       // Log the entry and all associated details.
//       console.log(entry.toJSON());
//     }
//   });

//   // Observe the 'measure' entries
//   po.observe({type: 'measure'});
// } catch (e) {
//     // Do nothing if the browser doesn't support this API.
//   }
//   const main = document.getElementById("content");
//   main.innerHTML = await screen.render();
//   if (screen.after_render) await screen.after_render();

// };
// // The load event listener has been removed
// document.addEventListener('DOMContentLoaded', () => {
//   router();
//   window.addEventListener('popstate', router);
// });

// window.addEventListener('popstate', router);
// document.addEventListener('DOMContentLoaded', () => {
//   document.body.addEventListener('click', e => {
//     if (e.target.matches('[data-link]')) {
//       e.preventDefault();
//       history.pushState(null, null, e.target.href);
//       router();
//     }
//   });
//   router();
// });

// // The load event listener has been removed
// document.addEventListener('DOMContentLoaded', router);
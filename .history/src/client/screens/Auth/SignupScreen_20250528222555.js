// src/screens/Signup.js
import mapboxgl from "mapbox-gl";
// import { initMap } from "../components/MapApi.js";
// import { geojsonStore } from "../components/GeojsonStores.js";
// import { createMapMarker } from "../components/MapMarker.js";
// import { createGeojsonListing } from "../components/GeojsonListing.js";
// import { createGeojsonStoreListing } from "../components/GeojsonStoreListing.js";
// import { createGeojsonReviewListing } from "../components/GeojsonReviewListing.js";
// import { createGeojsonArticleListing } from "../components/GeojsonArticleListing.js";
// import { createGeojsonBlogListing } from "../components/GeojsonBlogListing.js";
import { createGeocoderInput } from "../../components/map/geo/GeocoderInput.js";
// import AllBlog from "../components/AllBlog.js";
// import storeSelectedLocation from "../components/header/Header.js";
import mapRoute from "../../components/map/mapRoute.js";
import polyline from '@mapbox/polyline';
import HeaderHome from "../../components/header/HeaderHome.js";
import { createAuth0Client } from '@auth0/auth0-spa-js';


const SignupScreen = {
  render: async () => {
    // Retrieve the entered email from localStorage
  const email = localStorage.getItem('email') || '';
    return `
    <!------ SIGNUP SCREEN ------> 
    <div class="main">
    <!------ SIGNUP CONTENT ------> 
      <div class="auth-container signup-detail">
          <div class="signup-container">
            <!------ HERO ------> 
            <section class="signup-hero">
            
                <!---- HEADLINE ----> 
                <div class="signup-headline">

                    <!------ SIGNUP HEADER ------>
                    <div class="signup-header">

                        <!------ HEADLINE ------>
                        <div class="signup-headline">

                            <fieldset class="step-hide">
                              <div class="title">
                                <span class="header06">
                                  Welcome to Neumad
                                </span>
                              </div>
                              <div class="form-container">
                                <span class="text02 medium">
                                  Create your account
                                </span>
                                <form id="signup-form">
                                  <input type="email" id="email" placeholder="Email" value="${email}" required />
                                  <input type="text" id="username" placeholder="Username" required minlength="3" maxlength="30" />
                                  <div id="username-feedback" class="feedback-message"></div>
                                  <input type="password" id="password" placeholder="Password" required minlength="4" />
                                  <button type="submit" id="signup-button">Sign Up</button>
                                </form>

                                <a href="/login" class="text02 medium">Already have an account? Log in</a>
                              </div>
                            </fieldset>

                        </div>
                        <!------ HEADLINE ------>

                    </div>
                    <!------ SIGNUP HEADER ------>

                </div>
                <!---- HEADLINE ---->

            </section>
            <!------ HERO ------>

          </div>
      </div>
      <!------ SIGNUP CONTENT ------> 

    </div>
    <!------ SIGNUP SCREEN ------> 
    `;
  },

  after_render: async () => {
    const usernameInput = document.getElementById('username');
    const usernameFeedback = document.getElementById('username-feedback');
    const signupButton = document.getElementById('signup-button');
    let usernameValid = false;



    // Real-time username validation
    let usernameTimeout;
    usernameInput.addEventListener('input', () => {
      clearTimeout(usernameTimeout);
      const username = usernameInput.value.trim();
      
      // Clear previous feedback
      usernameFeedback.textContent = '';
      usernameFeedback.className = 'feedback-message';
      
      if (username.length === 0) {
        usernameValid = false;
        return;
      }
      
      if (username.length < 3) {
        usernameFeedback.textContent = 'Username must be at least 3 characters';
        usernameFeedback.className = 'feedback-message error';
        usernameValid = false;
        return;
      }
      
      if (username.length > 30) {
        usernameFeedback.textContent = 'Username must be less than 30 characters';
        usernameFeedback.className = 'feedback-message error';
        usernameValid = false;
        return;
      }
      
      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        usernameFeedback.textContent = 'Username can only contain letters, numbers, underscores, and dashes';
        usernameFeedback.className = 'feedback-message error';
        usernameValid = false;
        return;
      }
      
      // Check availability after a delay
      usernameTimeout = setTimeout(async () => {
        try {
          const response = await fetch('http://localhost:4000/check-username', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
          });
          
          const data = await response.json();
          
          if (data.available) {
            usernameFeedback.textContent = 'Username is available ✓';
            usernameFeedback.className = 'feedback-message success';
            usernameValid = true;
          } else {
            usernameFeedback.textContent = data.message || 'Username is not available';
            usernameFeedback.className = 'feedback-message error';
            usernameValid = false;
          }
        } catch (error) {
          console.error('Error checking username:', error);
          usernameFeedback.textContent = 'Error checking username availability';
          usernameFeedback.className = 'feedback-message error';
          usernameValid = false;
        }
      }, 500); // 500ms delay
    });
    // document.getElementById('signup-form').addEventListener('submit', async (event) => {
    //   event.preventDefault();
    
    //   const email = document.getElementById('email').value;
    //   const password = document.getElementById('password').value;
    
    //   const response = await fetch('http://localhost:4500/signup', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({ email, password })
    //   });
    
    //   const data = await response.json();
    //   console.log(data);
    // });


    // Handle form submission
    document.getElementById('signup-form').addEventListener('submit', async (event) => {
      event.preventDefault();
    
      const email = document.getElementById('email').value.trim();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;
      
      // Validate all fields
      if (!email || !username || !password) {
        alert('All fields are required');
        return;
      }
      
      if (!usernameValid) {
        alert('Please choose a valid and available username');
        return;
      }
      
      if (password.length < 4) {
        alert('Password must be at least 4 characters');
        return;
      }
      
      // Disable the button to prevent double submission
      signupButton.disabled = true;
      signupButton.textContent = 'Creating Account...';
    
      try {
        const response = await fetch('http://localhost:4000/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, username, password })
        });
        
        const data = await response.json();
    
        if (response.ok) {
          // Store tokens and user info
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          localStorage.setItem('userInfo', JSON.stringify(data.user));
          
          // Clear the stored email since we're now signed up
          localStorage.removeItem('email');
          
          // Redirect to user profile
          window.location.href = `/user/${data.user.username}`;
        } else {
          alert('Signup failed: ' + (data.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error during signup:', error);
        alert('An error occurred during signup. Please try again.');
      } finally {
        // Re-enable the button
        signupButton.disabled = false;
        signupButton.textContent = 'Sign Up';
      }
    });

    // document.getElementById('signup-form').addEventListener('submit', async (event) => {
    //   event.preventDefault();
    
    //   const email = document.getElementById('email').value;
    //   const password = document.getElementById('password').value;
    
    //   const response = await fetch('http://localhost:4500/signup', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({ email, password })
    //   });
    
    //   if (response.ok) {
    //     window.location.href = '/user'; // Redirect to user screen landing page
    //   } else {
    //     const data = await response.json();
    //     console.error(data);
    //   }
    // });
  }
};
export default SignupScreen;
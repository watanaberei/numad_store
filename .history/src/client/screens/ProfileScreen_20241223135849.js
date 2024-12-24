// src/screens/User.js
import mapboxgl from "mapbox-gl";
import { initMap } from "../components/MapApi.js";
import { geojsonStore } from "../components/GeojsonStores.js";
import { createMapMarker } from "../components/MapMarker.js";
import { createGeojsonListing } from "../components/GeojsonListing.js";
import { createGeojsonStoreListing } from "../components/GeojsonStoreListing.js";
import { createGeojsonReviewListing } from "../components/GeojsonReviewListing.js";
import { createGeojsonArticleListing } from "../components/GeojsonArticleListing.js";
import { createGeojsonBlogListing } from "../components/GeojsonBlogListing.js";
import { createGeocoderInput } from "../components/GeocoderInput.js";
import AllBlog from "../components/AllBlog.js";
import storeSelectedLocation from "../components/Header.js";
import mapRoute from "../components/mapRoute.js";
import polyline from '@mapbox/polyline';
import HeaderHome from "../components/HeaderHome.js"; 
import { createAuth0Client } from '@auth0/auth0-spa-js';


const ProfileScreen = {
  render: async () => {
    return `
    <!------ PROFILE SCREEN ------> 
    <div class="main">
      <!------ PROFILE CONTENT ------> 
      <div class="auth-container signup-detail">
          <div class="signup-container">
            <!------ HERO ------> 
            <section class="signup-hero">
            
                <!---- HEADLINE ----> 
                <div class="signup-headline">

                    <!------ PROFILE HEADER ------>
                    <div class="signup-header">

                        <!------ HEADLINE ------>
                        <div class="signup-headline">

                        
                         
                           
                              <div class="title">
                                <span class="header06">
                                  Profile
                                </span>
                              </div>
                              <div class="form-container">
                                <span class="text02 medium">
                                 User details
                                </span>
                                <div id="user-profile" class="details">
                                  <fieldset class="step-hide">
                                    <div class="title">
                                      <span class="header06">
                                        Finish singing up
                                      </span>
                                    </div>
                                    <div class="form-container">
                                        <form id="update-profile-form">
                                        <input type="text" id="firstName" placeholder="First Name" required />
                                        <input type="text" id="lastName" placeholder="Last Name" required />
                                        <input type="date" id="birthdate" placeholder="Birthdate" required />
                                        <button type="submit">Update Profile</button>
                                        </form>
                                    </div>
                                  </fieldset>
                                </div>
                                <a href="/signup" class="text02 medium">Make a new account
                                <!--<button type="submit">Login</button>-->
                              </div>
              

                            
                           
                

                        </div>
                        <!------ HEADLINE ------>

                    </div>
                    <!------ PROFILE HEADER ------>

                </div>
                <!---- HEADLINE ---->

            </section>
            <!------ HERO ------>

          </div>
      </div>
      <!------ PROFILE CONTENT ------> 

    </div>
    <!------ PROFILE SCREEN ------> 
    `;
  },
  after_render: async () => {
    const updateProfileForm = document.getElementById('update-profile-form');
    updateProfileForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const firstName = document.getElementById('firstName').value;
      const lastName = document.getElementById('lastName').value;
      const birthdate = document.getElementById('birthdate').value;

      const response = await fetch('http://localhost:4000/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ firstName, lastName, birthdate })
      });

    const data = await response.json();
      if (response.ok) {
        // Handle successful profile update
        alert('Profile updated successfully');
      } else {
        // Handle error
        console.error(data);
      }
    });
  
  } 
  // after_render: async () => {
  //   const signupForm = document.getElementById('signup-form');
  //   signupForm.addEventListener('submit', async (e) => {
  //     e.preventDefault();

  //     const email = document.getElementById('email').value;
  //     const password = document.getElementById('password').value;

  //     const response = await fetch('http://localhost:4000/signup', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //       body: JSON.stringify({ email: email, password: password })
  //     });

  //     const data = await response.json();
  //     if (response.ok) {
  //       // Handle successful signup (e.g., show a success message, redirect to login page, etc.)
  //     } else {
  //       // Handle error (e.g., show an error message)
  //       console.error(data);
  //     }
  //   });
  // }
};
export default ProfileScreen;
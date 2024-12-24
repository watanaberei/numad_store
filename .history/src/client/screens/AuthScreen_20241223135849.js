// src/screens/Signup.js
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


const AccountScreen = {
  render: async () => {
    return `
    <!------ SIGNUP SCREEN ------> 
    <div class="main">
      <!------ SIGNUP CONTENT ------> 
      <div class="auth-container account-detail">
          <div class="account-container">
            <!------ HERO ------> 
            <section class="account-hero">
            
                <!---- HEADLINE ----> 
                <div class="account-headline">

                    <!------ SIGNUP HEADER ------>
                    <div class="account-header">

                        <!------ HEADLINE ------>
                        <div class="account-headline">

                          <fieldset class="step-hide">
                            <div class="title">
                              <span class="header06">
                                  Log in or create an account
                              </span>
                            </div>
                            <div class="form-container">
                              <span class="text02 medium">
                                Enter your email
                              </span>
                              <form id="account-form">
                                <input type="email" id="email" name="email" placeholder="Email" required>
                                <button type="submit">Submit</button>
                              </form>
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
    document.getElementById('account-form').addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const email = document.getElementById('email').value;
  
      // Store the entered email in localStorage
      localStorage.setItem('email', email);
  
      try {
        const response = await fetch('http://localhost:4500/account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
  
        if (data.userExists) {
          // Redirect to the login page
          window.location.href = '/login';
        } else {
          // Redirect to the signup page
          window.location.href = '/signup';
        }
      } catch (error) {
        console.error('Fetch operation failed: ', error);
      }
    });
  }
};

export default AccountScreen;
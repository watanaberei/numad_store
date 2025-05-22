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

                        
                          <!--<form action="/signup" id="signup-form" method="post">-->

                            <fieldset class="step-hide">
                              <div class="title">
                                <span class="header06">
                                  Welcome Neumad
                                </span>
                              </div>
                              <div class="form-container">
                                <span class="text02 medium">
                                  Login or sign up
                                </span>
                                <form id="signup-form">
                                  <input type="email" id="email" placeholder="Email" value="${email}" required />
                                  <input type="password" id="password" placeholder="Password" required />
                                  <button type="submit">Signup</button>
                                </form>

                                <a href="/signup" class="text02 medium">Make a new account
                                <!--<button type="submit">Login</button>-->
                              </div>
                            </fieldset>

                            
                            <!--
                            <fieldset class="step-hide">
                              <div class="title">
                                <span class="header06">
                                  Finish singing up
                                </span>
                              </div>
                              <div class="container form">
                                <span class="text02 medium>
                                  Name
                                </span>
                                <input type="text" id="firstName" placeholder="First Name" required />
                                <input type="text" id="lastName" placeholder="Last Name" required /> 
                              </div>
                              <div class="container form">
                                <span class="text02 medium>
                                  Birthdate
                                </span>
                                <input type="date" name="birthdate" id="birthdate" required />
                              </div>
                              <div class="container form">
                                <span class="text02 medium>
                                  Confirm email
                                </span>
                                <input type="email" id="email" placeholder="Confirm Email" required />
                              </div>
                             </fieldset>
                            -->
                          <!--</form>-->

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


    document.getElementById('signup-form').addEventListener('submit', async (event) => {
      event.preventDefault();
    
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
    
      const response = await fetch('http://localhost:4500/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
    
      if (response.ok) {
        window.location.href = '/user'; // Redirect to user screen landing page
      } else {
        const data = await response.json();
        console.error(data);
      }
    });
  }
};
export default SignupScreen;
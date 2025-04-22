// src/screens/User.js
import mapboxgl from "mapbox-gl";
import { initMap } from "../components/map/MapApi.js";
import { geojsonStore } from "../components/map/geo/GeojsonStores.js";
import { createMapMarker } from "../components/map/MapMarker.js";
import { createGeojsonListing } from "../components/map/geo/GeojsonListing.js";
import { createGeojsonStoreListing } from "../components/map/geo/GeojsonStoreListing.js";
import { createGeojsonReviewListing } from "../components/map/geo/GeojsonReviewListing.js";
import { createGeojsonArticleListing } from "../components/map/geo/GeojsonArticleListing.js";
import { createGeojsonBlogListing } from "../components/map/geo/GeojsonBlogListing.js";
import { createGeocoderInput } from "../components/map/geo/GeocoderInput.js";
import AllBlog from "../components/blog/AllBlog.js";
import storeSelectedLocation from "../components/header/Header.js";
import mapRoute from "../components/map/mapRoute.js";
import polyline from '@mapbox/polyline';
import HeaderHome from "../components/header/HeaderHome.js"; 
import { createAuth0Client } from '@auth0/auth0-spa-js';
import * as element from "../components/elements.js";
import createStoreCard from "../components/cards/_archive/card-store.js";
import dotenv from 'dotenv';

// dotenv.config();

const API_URL = 'http://localhost:4000'; // Make sure this matches your server URL

const UserScreen = {
  render: async () => {
    // Check if user is logged in
    const accessToken = localStorage.getItem('accessToken');
    
    // If no access token is found, redirect to home page
    if (!accessToken) {
      window.location.href = '/';
      return '<div>Redirecting to home page...</div>';
    }
    
    const header = element.header;
    const title = element.title;
    const titleCounter = element.titleCounter;
    let checkedInStores = [];

    try {
      const response = await fetch(`${API_URL}/api/user`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.ok) {
        checkedInStores = await response.json();
        console.log("Successfully fetched checked-in stores:", checkedInStores);
      } else {
        console.error('Failed to fetch checked-in stores, status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching checked-in stores:', error);
    }

    return `
      <!------ User SCREEN ------> 
      <div class="main grid05">
        <!------ User CONTENT ------> 
        <div class="col03 auth-container signup-detail">
            <div class="signup-container">
              <!------ HERO ------> 
              <section class="signup-hero">
              
                  <!---- HEADLINE ----> 
                  <div class="signup-headline">

                      <!------ User HEADER ------>
                      <div class="signup-header">

                          <!------ HEADLINE ------>
                          <div class="signup-headline">

                          
                          
                            <div class="container">
                              <div id="checkedInStores" class="postStores list"> 
                                ${title.render('Checked-in')}
                                <div id="checkedInStoresContent">
                                  <!-- This will be populated in after_render -->
                                  <p>Loading checked-in stores...</p>
                                </div>
                              </div>
                            </div>



                            <!----------- CHECKED IN STORES ----------->
                            <div class="container">

                            
                              <div class="container">
                                <div id="savedStores" class="postStores list"> 
                                  ${title.render('Saved')}
                                  <div id="savedStoresContent"></div>
                                </div>
                              </div>

                              <div class="container">
                                <div id="myCollection" class="postStores list"> 
                                  ${title.render('My Collection')}
                                  <div id="myCollectionContent"></div>
                                </div>
                              </div>

                              <div class="container">
                                <div id="recentlyVisited" class="postStores list"> 
                                  ${title.render('Recently Visited')}
                                  <div id="recentlyVisitedContent"></div>
                                </div>
                              </div>


                              <div id="checkedInStores" class="postStores list"> 
                                ${title.render('Checked-in')}
                                ${checkedInStores.length > 0 ? checkedInStores.map(store => `
                                  <div class="store-card">
                                    <h3>${store.name}</h3>
                                    <p>${store.address}</p>
                                    <p>Impression: ${store.impression || 'None'}</p>
                                  </div>
                                `).join('') : '<p>No checked-in stores</p>'}
                              </div>
                            </div>

                            <div class="container">
                              <div id="postStores" class="postStores list"> 
                                ${title.render('Saved')}
                              </div>
                            </div>

                            <div class="container">
                              <div id="postStores" class="postStores list"> 
                                ${title.render('My Collecction')}
                              </div>
                            </div>

                            <div class="container">
                              <div id="postStores" class="postStores list"> 
                                ${title.render('Recently Visisted')}
                              </div>
                            </div>



                              <div class="form-container">
                              <span class="text02 medium">
                              User details
                              </span>
                              <div id="user-User" class="details">
                                <fieldset class="step-hide">
                                  <div class="title">
                                    <span class="header06">
                                      Finish signing up
                                    </span>
                                  </div>
                                  <div class="form-container">
                                      <form id="update-User-form">
                                      <input type="text" id="firstName" placeholder="First Name" required />
                                      <input type="text" id="lastName" placeholder="Last Name" required />
                                      <input type="date" id="birthdate" placeholder="Birthdate" required />
                                      <button type="submit">Update User</button>
                                      </form>
                                  </div>
                                </fieldset>
                              </div>
                              <a href="/signup" class="text02 medium">Make a new account</a>
                            </div>
                          </div>
                          <!------ HEADLINE ------>

                      </div>
                      <!------ User HEADER ------>

                  </div>
                  <!---- HEADLINE ---->

              </section>
              <!------ HERO ------>

            </div>
        </div>
        <!------ User CONTENT ------> 

      </div>
      <!------ User SCREEN ------> 
      `;
    },
    after_render: async () => {
      // Check if user is logged in
      const accessToken = localStorage.getItem('accessToken');
      
      // If no access token is found, redirect to home page
      if (!accessToken) {
        window.location.href = '/';
        return;
      }
      
      const checkedInStoresContent = document.getElementById('checkedInStoresContent');
      
      if (!checkedInStoresContent) {
        console.error('Could not find checkedInStoresContent element');
        return;
      }
  
      try {
        // Make API request to get user's checked-in stores
        const response = await fetch(`${API_URL}/api/user/checkedIn`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (response.ok) {
          const checkedInStores = await response.json();
          console.log('Checked-in stores from API:', checkedInStores);
          
          if (Array.isArray(checkedInStores) && checkedInStores.length > 0) {
            // Render each store card
            let storesHTML = '';
            for (let store of checkedInStores) {
              try {
                // Try to use createStoreCard if the store has the required properties
                const storeCardHTML = await createStoreCard.render(store);
                storesHTML += `
                  <div class="store-card">
                    ${storeCardHTML}
                    <p>Impression: ${store.impression || 'None'}</p>
                  </div>
                `;
              } catch (error) {
                // Fallback to simple display if createStoreCard fails
                console.warn('Failed to create store card, using fallback display', error);
                storesHTML += `
                  <div class="store-card">
                    <h3>${store.name || store.storeId || 'Unknown Store'}</h3>
                    <p>${store.address || ''}</p>
                    <p>Impression: ${store.impression || 'None'}</p>
                  </div>
                `;
              }
            }
            checkedInStoresContent.innerHTML = storesHTML;
          } else if (typeof checkedInStores === 'string' && checkedInStores) {
            // Handle case where API returns a single store ID instead of an array
            checkedInStoresContent.innerHTML = `
              <div class="store-card">
                <h3>Currently checked into: ${checkedInStores}</h3>
              </div>
            `;
          } else {
            checkedInStoresContent.innerHTML = '<p>No checked-in stores</p>';
          }
        } else {
          console.error('Failed to fetch checked-in stores, status:', response.status);
          checkedInStoresContent.innerHTML = '<p>Failed to load checked-in stores</p>';
        }
      } catch (error) {
        console.error('Error fetching checked-in stores:', error);
        checkedInStoresContent.innerHTML = '<p>Error loading checked-in stores</p>';
      }
      
      // Set up event listener for the update user form
      const updateUserForm = document.getElementById('update-User-form');
      if (updateUserForm) {
        updateUserForm.addEventListener('submit', async (e) => {
          e.preventDefault();

          const firstName = document.getElementById('firstName').value;
          const lastName = document.getElementById('lastName').value;
          const birthdate = document.getElementById('birthdate').value;

          try {
            const response = await fetch(`${API_URL}/settings`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
              },
              body: JSON.stringify({ firstName, lastName, birthdate })
            });

            const data = await response.json();
            if (response.ok) {
              alert('User updated successfully');
            } else {
              console.error('Failed to update user:', data);
              alert('Failed to update user: ' + (data.message || 'Unknown error'));
            }
          } catch (error) {
            console.error('Error updating user:', error);
            alert('Error updating user: ' + error.message);
          }
        });
      }
    }
  };

  export default UserScreen;
    

  //   after_render: async () => {
  //     const checkedInStoresContent = document.getElementById('checkedInStoresContent');
  //     const accessToken = localStorage.getItem('accessToken');
  
  //     const updateUserForm = document.getElementById('update-User-form');
  //     if (!accessToken) {
  //       checkedInStoresContent.innerHTML = '<p>Please log in to view checked-in stores</p>';
  //       return;
  //     }
  
  //     try {
  //       const response = await fetch(`${API_URL}/api/user/checkedIn`, {
  //         headers: {
  //           'Authorization': `Bearer ${accessToken}`
  //         }
  //       });
  //       if (response.ok) {
  //         const checkedInStores = await response.json();
  //         let storesHTML = '';
  //         for (let store of checkedInStores) {
  //           const storeCardHTML = await createStoreCard.render(store);
  //           storesHTML += `
  //             <div class="store-card">
  //               ${storeCardHTML}
  //               <p>Impression: ${store.impression || 'None'}</p>
  //             </div>
  //           `;
  //         }
  //         checkedInStoresContent.innerHTML = storesHTML || '<p>No checked-in stores</p>';
  //       } else {
  //         console.error('Failed to fetch checked-in stores');
  //         checkedInStoresContent.innerHTML = '<p>Failed to load checked-in stores</p>';
  //       }
  //     } catch (error) {
  //       console.error('Error fetching checked-in stores:', error);
  //       checkedInStoresContent.innerHTML = '<p>Error loading checked-in stores</p>';
  //     }
  //   }
  // };

  // export default UserScreen;
  
  
    //   try {
    //     const response = await fetch('http://localhost:4000/api/user/checkedIn', {
    //       headers: {
    //         'Authorization': `Bearer ${accessToken}`
    //       }
    //     });
    //     if (!response.ok) {
    //       throw new Error(`HTTP error! status: ${response.status}`);
    //     }
    //     const checkedInStores = await response.json();
    //   updateUserForm.addEventListener('submit', async (e) => {
    //     e.preventDefault();

    //     const firstName = document.getElementById('firstName').value;
    //     const lastName = document.getElementById('lastName').value;
    //     const birthdate = document.getElementById('birthdate').value;

    //     const response = await fetch('http://localhost:4000/user', {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
    //       },
    //       body: JSON.stringify({ firstName, lastName, birthdate })
    //     });

    //   const data = await response.json();
    //     if (response.ok) {
    //       // Handle successful User update
    //       alert('User updated successfully');
    //     } else {
    //       // Handle error
    //       console.error(data);
    //     }
        
    //   });
    // } catch (error) {
    //   console.error('Error fetching checked-in stores:', error);
    //   // Handle the error appropriately in your UI
    // }
    
    
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


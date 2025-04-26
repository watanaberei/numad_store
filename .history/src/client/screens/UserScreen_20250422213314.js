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
import createStoreCard from "../components/cards/cardStore.js";
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
    
    // The rest of the render function doesn't need to fetch data
    // We'll do all API calls in the after_render function to avoid blocking the initial render

    return `
      <!------ User SCREEN ------> 
      <div class="main col05">
        <!------ User CONTENT ------> 
        <div class="col03 auth-container activity-detail">
            <div class="col03 activity-container">
              <!------ HERO ------> 
              <section class="col03 activity">
              
                  <!---- HEADLINE  
                  <div class="activity-headline">
                  ---->

                      <!------ User HEADER ------>
                      <div class="col03 activity-header">

                          <!------ HEADLINE ------>
                          <div class="activity-headline">

                            <!----------- CHECKED IN STORES ----------->
                            <div class="col03 container">
                              <div id="col03 checkedInStores" class="postStores list"> 
                                ${title.render('Checked-in')}
                                <div id="col03 checkedInStoresContent">
                                  <span class="text02 medium">Loading check-in history...</span>
                                </div>
                              </div>
                            </div>

                            <!----------- VISIT HISTORY ----------->
                            <div class="container">
                              <div id="recentlyVisited" class="postStores list"> 
                                ${title.render('Recently Visited')}
                                <div id="recentlyVisitedContent">
                                  <p>Loading visit history...</p>
                                </div>
                              </div>
                            </div>

                            <!----------- SAVED STORES ----------->
                            <div class="container">
                              <div id="savedStores" class="postStores list"> 
                                ${title.render('Saved')}
                                <div id="savedStoresContent">
                                  <p>Loading saved stores...</p>
                                </div>
                              </div>
                            </div>

                            <!----------- USER DETAILS ----------->
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

                  <!----
                  </div>
                  HEADLINE ---->

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
      const recentlyVisitedContent = document.getElementById('recentlyVisitedContent');
      const savedStoresContent = document.getElementById('savedStoresContent');
      
      if (!checkedInStoresContent) {
        console.error('Could not find checkedInStoresContent element');
        return;
      }
      
      try {
        // Fetch both user data and store data
        const [userResponse, storeResponse] = await Promise.all([
          fetch(`${API_URL}/api/user`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            }
          }),
          fetch(`${API_URL}/api/user/store`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            }
          })
        ]);

        if (!userResponse.ok) {
          throw new Error(`Failed to fetch user data: ${userResponse.status}`);
        }
        if (!storeResponse.ok) {
          throw new Error(`Failed to fetch store data: ${storeResponse.status}`);
        }

        const [userData, storeData] = await Promise.all([
          userResponse.json(),
          storeResponse.json()
        ]);

        console.log('User data:', userData);
        console.log('Store data:', storeData);

        // Display currently checked-in store
        if (userData.checkedInStore) {
          const currentStoreData = storeData.stores.find(store => store.storeId === userData.checkedInStore);
          console.log('[UserScreen.currentStoreData] Current store data:', currentStoreData);
          if (currentStoreData) {
            const storeCardHTML = await createStoreCard.render(currentStoreData);
            checkedInStoresContent.innerHTML = `
              <div class="current-checkin">
                <h3>Currently Checked In</h3>
                ${storeCardHTML}
              </div>
            `;
            // checkedInStoresContent.innerHTML = `
            //   <div class="current-checkin">
            //     <h3>Currently Checked In</h3>
            //     ${storeCardHTML}
            //   </div>
            // `;
          } else {
            checkedInStoresContent.innerHTML = '<p>Store information not available</p>';
          }
        } else {
          checkedInStoresContent.innerHTML = '<p>Not currently checked in to any store</p>';
        }

        // Display check-in history
        if (storeData.checkedInStores && storeData.checkedInStores.length > 0) {
          const historySection = document.createElement('div');
          historySection.className = 'store-history';
          historySection.innerHTML = '<h4>Recent Check-ins</h4>';

          // const historyHTML = storeData.checkedInStores.map(checkIn => {
          //   const storeInfo = storeData.stores.find(store => store.storeId === checkIn.storeId);
          //   return `
          //     <div class="history-item">
          //       <h5>${storeInfo ? storeInfo.storeInfo.storeName : checkIn.storeId}</h5>
          //       ${storeInfo ? `
          //         <p>Location: ${storeInfo.storeInfo.city}, ${storeInfo.storeInfo.state}</p>
          //         <p>Type: ${storeInfo.storeInfo.storeType}</p>
          //         <p>Rating: ${storeInfo.storeInfo.rating}</p>
          //       ` : ''}
          //       <p>Checked in: ${new Date(checkIn.checkedInAt).toLocaleString()}</p>
          //     </div>
          //   `;
          // }).join('');
          // Create cards for each store in history
          const historyCards = await Promise.all(
            storeData.checkedInStores.map(async (checkIn) => {
              const storeInfo = storeData.stores.find(store => store.storeId === checkIn.storeId);
              if (storeInfo) {
                return await createStoreCard.render(storeInfo);
              }
              return null;
            })
          );

          // historySection.innerHTML += historyHTML;

          // Filter out null values and join the cards
          const historyHTML = historyCards.filter(Boolean).join('');
          historySection.innerHTML += `<div class="history-grid">${historyHTML}</div>`;
          checkedInStoresContent.appendChild(historySection);
        }

        // Initialize card effects after rendering
        await createStoreCard.after_render();

      } catch (error) {
        console.error('Error fetching data:', error);
        checkedInStoresContent.innerHTML = `<p>Error loading data: ${error.message}</p>`;
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
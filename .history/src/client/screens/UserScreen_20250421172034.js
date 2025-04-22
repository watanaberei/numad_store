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
    
    // The rest of the render function doesn't need to fetch data
    // We'll do all API calls in the after_render function to avoid blocking the initial render

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

                            <!----------- CHECKED IN STORES ----------->
                            <div class="container">
                              <div id="checkedInStores" class="postStores list"> 
                                ${title.render('Checked-in')}
                                <div id="checkedInStoresContent">
                                  <p>Loading check-in history...</p>
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
      const recentlyVisitedContent = document.getElementById('recentlyVisitedContent');
      const savedStoresContent = document.getElementById('savedStoresContent');
      
      if (!checkedInStoresContent) {
        console.error('Could not find checkedInStoresContent element');
        return;
      }
      
      try {
        // Directly access the /user endpoint to get all user data at once
        const response = await fetch(`${API_URL}/api/user`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log('User data from API:', userData);
          
          // Check if we have a current check-in
          const currentlyCheckedIn = userData.checkedInStore;
          
          // Display currently checked-in store
          if (currentlyCheckedIn) {
            // Fetch store data for the checked-in store
            const storeResponse = await fetch(`${API_URL}/api/user/store`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
              },
              body: JSON.stringify({
                storeId: currentlyCheckedIn,
                action: 'checkin'
              })
            });

            if (storeResponse.ok) {
              const storeData = await storeResponse.json();
              console.log('Store data:', storeData);
              if (storeData.storeInfo) {
                checkedInStoresContent.innerHTML = `
                  <div class="store-card">
                    <h3>Currently checked into: ${storeData.storeInfo.storeName}</h3>
                    <p>Location: ${storeData.storeInfo.city}, ${storeData.storeInfo.state}</p>
                    <p>Distance: ${storeData.storeInfo.distance}</p>
                    <p>Status: ${storeData.storeInfo.status}</p>
                    <p>Type: ${storeData.storeInfo.storeType}</p>
                    <p>Rating: ${storeData.storeInfo.rating} (${storeData.storeInfo.review_count} reviews)</p>
                    ${storeData.storeInfo.gallery ? `<div class="store-gallery">Gallery available</div>` : ''}
                  </div>
                `;
              }
            } else {
              console.error('Failed to fetch store data:', await storeResponse.text());
              checkedInStoresContent.innerHTML = '<p>Failed to load store details</p>';
            }
          } else {
            checkedInStoresContent.innerHTML = '<p>Not currently checked in to any store</p>';
          }
          
          // If we have access to checkedInStores history from user data, display it
          if (userData.checkedInStores && userData.checkedInStores.length > 0) {
            // Create a store history section
            const historySection = document.createElement('div');
            historySection.className = 'store-history';
            historySection.innerHTML = '<h4>Recent Check-ins</h4>';
            
            // Sort by check-in date (most recent first)
            const sortedHistory = [...userData.checkedInStores].sort((a, b) => {
              return new Date(b.checkedInAt) - new Date(a.checkedInAt);
            });
            
            // Take last 6 entries
            const recentHistory = sortedHistory.slice(0, 6);
            
            // For each store in history, fetch its details
            const historyPromises = recentHistory.map(async (entry) => {
              try {
                const historyResponse = await fetch(`${API_URL}/api/user/store`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                  },
                  body: JSON.stringify({
                    storeId: entry.storeId,
                    action: 'checkin'
                  })
                });
                
                if (historyResponse.ok) {
                  const storeData = await historyResponse.json();
                  return {
                    ...entry,
                    storeInfo: storeData.storeInfo
                  };
                }
                return entry;
              } catch (error) {
                console.error('Error fetching store history:', error);
                return entry;
              }
            });
            
            // Wait for all store data to be fetched
            const enrichedHistory = await Promise.all(historyPromises);
            
            // Generate HTML for each check-in with store info
            const historyHTML = enrichedHistory.map(entry => `
              <div class="history-item">
                <h5>${entry.storeInfo ? entry.storeInfo.storeName : entry.storeId}</h5>
                ${entry.storeInfo ? `
                  <p>Location: ${entry.storeInfo.city}, ${entry.storeInfo.state}</p>
                  <p>Type: ${entry.storeInfo.storeType}</p>
                  <p>Rating: ${entry.storeInfo.rating}</p>
                ` : ''}
                <p>Checked in: ${new Date(entry.checkedInAt).toLocaleString()}</p>
              </div>
            `).join('');
            
            historySection.innerHTML += historyHTML;
            checkedInStoresContent.appendChild(historySection);
          }
        } else {
          console.error('Failed to fetch user data, status:', response.status);
          checkedInStoresContent.innerHTML = '<p>Failed to load user data. Please try again later.</p>';
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        checkedInStoresContent.innerHTML = '<p>Error loading user data. Please try again later.</p>';
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
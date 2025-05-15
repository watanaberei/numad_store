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
import { fieldText } from "../components/form/Form.js";
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

    const fields = [
      { label: 'Full Name', placeholder: 'First Name', type: 'text', required: true, value: '' },
      { label: 'Birthdate', placeholder: 'Birthdate', type: 'date', required: true, value: '' },
      { label: 'Description', placeholder: 'Description', type: 'text', required: true, value: '' },
      { label: 'Location', placeholder: 'Location', type: 'text', required: true, value: '' },
      { label: 'Website', placeholder: 'Website', type: 'text', required: true, value: '' },
      { label: 'Full Name', placeholder: 'Full Name', type: 'text', required: true, value: '' },
      { label: 'Phone Number', placeholder: 'Phone Number', type: 'text', required: true, value: '' }
    ];
    
    // The rest of the render function doesn't need to fetch data
    // We'll do all API calls in the after_render function to avoid blocking the initial render

    return `
      <!------ User SCREEN ------> 
      <div class="main col05">




        <!----------- USER DETAILS ----------->
      
        <div class="col02 profile-container">
          ${fields.map(field => fieldText.render(field)).join('')}
          <div id="profile-details">
          </div>
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
                  <input class="input-field" type="text" id="firstName" placeholder="First Name" required />
                  <input class="input-field" type="text" id="lastName" placeholder="Last Name" required />
                  <input class="input-field" type="date" id="birthdate" placeholder="Birthdate" required />
                  <input class="input-field" type="text" id="description" placeholder="Description" required />
                  <input class="input-field" type="text" id="location" placeholder="Location" required />
                  <input class="input-field" type="text" id="website" placeholder="Website" required />
                  <input class="input-field" type="text" id="fullName" placeholder="Full Name" required />
                  <input class="input-field" type="text" id="phoneNumber" placeholder="Phone Number" required />
                  <button type="submit">Update User</button>
                  </form>
              </div>
            </fieldset>
          </div>
          <a href="/signup" class="text02 medium">Make a new account</a>
        </div>

        <!----------- USER DETAILS ----------->





        <!----------- User CONTENT ----------->

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
                              <div id="checkedInStores" class="grid03 postStores list"> 
                                ${title.render('Checked-in')}
                                <div id="checkedInStoresContent" class="col03">
                                  <span class="text02 medium">Loading check-in history...</span>
                                </div>
                              </div>
                            </div>

                            <!----------- VISIT HISTORY ----------->
                            <div class="col03 container">
                              <div id="recentlyVisited" class="grid03postStores list"> 
                                ${title.render('Recently Visited')}
                                <div id="recentlyVisitedContent" class="col03">
                                  <span class="text02 medium">Loading visit history...</span>
                                </div>
                              </div>
                            </div>

                            <!----------- SAVED STORES ----------->
                            <div class="col03 container">
                              <div id="savedStores" class="grid03 postStores list"> 
                                ${title.render('Saved')}
                                <div id="savedStoresContent" class="col03">
                                  <span class="text02 medium">Loading saved stores...</span>
                                </div>
                              </div>
                            </div>

                            <!--
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
                            -->
                            
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
        
        <!----------- User CONTENT ----------->


        
      </div>
      <!------ User SCREEN ------> 
      `;
    },
    after_render: async () => {
       // Check if user is logged in
      const accessToken = localStorage.getItem('accessToken');
            
      // If no access token is found, redirect to home page
      if (!accessToken) {
        checkedInStoresContent.innećrHTML = '<p>Please log in to view checked-in stores</p>';
        window.location.href = '/';
        return;
      }
    

      // USER DETAILS
      const profileDetails = document.getElementById('profile-details');

      try {
        const response = await fetch(`${API_URL}/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        });

        const data = await response.json();
        if (response.ok) {
          // Update profile details display
          if (profileDetails) {
            profileDetails.innerHTML = `
              <p>Email: ${data.email}</p>
              <p>First Name: ${data.firstName || 'Not set'}</p> 
              <p>Last Name: ${data.lastName || 'Not set'}</p>
              <p>Birthdate: ${data.birthdate || 'Not set'}</p>
              <p>Description: ${data.description || 'Not set'}</p>
              <p>Location: ${data.location || 'Not set'}</p>
              <p>Website: ${data.website || 'Not set'}</p>
              <p>Full Name: ${data.fullName || 'Not set'}</p>
              <p>Phone Number: ${data.phoneNumber || 'Not set'}</p>
            `;
          }
        } else {
          console.error('Failed to fetch user profile:', data);
          alert('Failed to fetch user profile: ' + (data.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        alert('Error fetching user profile: ' + error.message);
      }

      // Commented out code for authServer.js:
      /*
      // In authServer.js
      app.get('/profile', authenticateToken, async (req, res) => {
        try {
          const profile = await UserModel.findOne({ email: req.user.email });
          if (!profile) {
            return res.status(404).json({ message: 'User not found' });
          }
          res.json({
            email: profile.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            birthdate: profile.birthdate
          });
        } catch (error) {
          res.status(500).json({ message: 'Error fetching user data' });
        }
      });
      */




      //////////////// ACTIVITY DETAILS
      
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
              <div class="grid03 current-checkin">
                <span class="text06">Currently Checked In</span>
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
          historySection.className = 'grid03 store-history';
          historySection.innerHTML = '<span class="text06">Recent Check-ins</span>';

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
          historySection.innerHTML += `<div class="col03 grid03 history-grid">${historyHTML}</div>`;
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

          const firstName = document.getElementById('input-firstName').value;
          const lastName = document.getElementById('input-lastName').value;
          const birthdate = document.getElementById('input-birthdate').value;
          const description = document.getElementById('input-description').value;
          const location = document.getElementById('input-location').value;
          const website = document.getElementById('input-website').value;
          const fullName = document.getElementById('input-fullName').value;
          const phoneNumber = document.getElementById('input-phoneNumber').value;

          try {
            const response = await fetch(`${API_URL}/settings`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
              },
              body: JSON.stringify({ firstName, lastName, birthdate, description, location, website, fullName, phoneNumber })
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
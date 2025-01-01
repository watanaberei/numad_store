import { format, parseISO } from "date-fns";
import * as element from "./elements.js";
import * as suggestion from "./suggestion.js";
import * as address from "./address.js";
import * as handle from "./handle.js";
import * as accordion from "./accordion.js";
import enUS from "date-fns/locale/en-US/index.js";
import gl from "date-fns/locale/gl/index.js";




export const panel = {
  render: (store) => {

  const storeGenre = store.storeGenre;
  const storeType = store.storeType;

  //////////////////////////////////////////
  //////////////// LOCATION ////////////////
  //////////////////////////////////////////
  const storeAddress = store.storeAddress;
  console.log("storeAddress", storeAddress)
  const storeRegion = store.storeRegion;
  const storeCity = address.city(storeAddress);
  const designator = address.designator(storeAddress);
  const storeAddressMin = address.address(storeAddress);
  
  const storeDistance = store.storeDistance;
  const storeRange = store.storeRange;
  const storeName = store.storeName;



  // const storeAddressShort = ;
  const storeAddressStreet = storeAddress.split(",")[0];
  console.log(storeAddressStreet);


  console.log(
    "LOCATION = ", "storeAddressMin: ", storeAddressMin, " ,designator: ", designator, ",storeCity: ", storeCity, " ,storeRegion: ", storeRegion, " ,storeAddress: ", storeAddress, " ,storeDistance: ", storeDistance, " ,storeRange: ", storeRange, "/ ",
    );


  //////////////////////////////////////////
  //////////////// LOCATION ////////////////
  //////////////////////////////////////////




  
  const storeBest = store.storeBest;






 /////////////////////////////////////////
  ///////////////// HOURS /////////////////
  ///////////////////////////////////////// 
  const storeHours = store.storeHours;
  const storeHoursDay = storeHours[0];
  const storeHoursTime = storeHours[1];

  const currentDayIndex = new Date().getDay(); // This will return a number from 0 (Sunday) to 6 (Saturday)
  const currentStoreDay = storeHoursDay[currentDayIndex]; // Get the current day
  const currentStoreHours = storeHoursTime[currentDayIndex]; // Get the hours for the current day
  const currentStoreTime = currentStoreDay + " " + currentStoreHours; 
  // Split the currentStoreHours into opening and closing hours
  const [openingHours, closingHours] = currentStoreHours.split('-').map(time => {
    const [hours, minutes] = time.trim().split(':');
    return { hours: parseInt(hours, 10), minutes: parseInt(minutes, 10) };
  });

  // Create a Date object for the current time
  const currentTime = new Date();
  const currentHours = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();

  // Create a Date object for the closing time
  const closingTime = new Date();
  closingTime.setHours(closingHours.hours);
  closingTime.setMinutes(closingHours.minutes);

  // Calculate the difference in minutes between the current time and the closing time
  const diffMinutes = (closingTime.getTime() - currentTime.getTime()) / (1000 * 60);

  let currentStoreTimeStatus;
  if (currentHours < openingHours.hours || currentHours > closingHours.hours) {
    currentStoreTimeStatus = 'closed';
  } else if (diffMinutes <= 60) {
    currentStoreTimeStatus = 'closing soon';
  } else {
    currentStoreTimeStatus = 'open';
  }

  console.log("Current Store Time Status:", currentStoreTimeStatus);
  

  console.log("Current Day:", currentStoreTime); 

  /////////////////////////////////////////
  ///////////////// HOURS /////////////////
  /////////////////////////////////////////







  /////////////////////////////////////////
  //////////////// RATINGS ////////////////
  /////////////////////////////////////////

  const storeRatings = store.storeRatings;
  const storeReviews = store.storeReviews;
  const storeLogo = store.storeLogo;
  const storeContact = store.storeContact;
  const storeLocatedIn = store.storeLocatedIn;

    // STORE RATING
    // GOOGLE
    const storeRatingGoogle = store.storeRatingGoogle;
    const ratingGoogleRate = storeRatingGoogle[0].key;
    const ratingGoogleCount = storeRatingGoogle[0].value;
    const ratingGoogleLink = "https://www.google.com/search?q=" + storeName;
    // YELP
    const storeRatingYelp = store.storeRatingYelp;
    const ratingYelpRate = storeRatingYelp[0].key;
    const ratingYelpCount = storeRatingYelp[0].value;

    const storeHandle = store.storeHandle;
    const ratingYelpLink = handle.getYelpLink(storeHandle);

    let googleRating = {
      sourceName: "Google",
      sourceLink: ratingGoogleLink,
      sourceCount: ratingGoogleCount,
      sourceRating: ratingGoogleRate
    };

    let yelpRating = {
      sourceName: "Yelp",
      sourceLink: ratingYelpLink,
      sourceCount: ratingYelpCount,
      sourceRating: ratingYelpRate,
    }

    
    const generateRating = (source) => {
      const sourceName = source.sourceName;
      const sourceLink = source.sourceLink;
      const souceRating = source.sourceRating;
      const sourceCount = source.sourceCount;
      const ratingHTML = `
        <div class="text03 medium">
          <a href="${sourceLink}" class="title">
            <div class="title">${sourceName}: ${souceRating}</div>${iconRatingStar} <div class="subtitle">(${sourceCount})</div>
          </a>
        </div>
      `;
      return ratingHTML;
    };

    const ratingGoogle = generateRating(googleRating);
    const ratingYelp = generateRating(yelpRating);

    /////////////////////////////////////////
    //////////////// RATINGS ////////////////
    /////////////////////////////////////////








    //  NEUSTAR
    const neustarAward = element.neustarAward.render(store.storeNeustar);
    






    console.log(
      "storeName", storeName, "/ ", 
      "LOCATION = ", "storeAddressMin: ", storeAddressMin, " ,designator: ", designator, ",storeCity: ", storeCity, " ,storeRegion: ", storeRegion, " ,storeAddress: ", storeAddress, " ,storeDistance: ", storeDistance, " ,storeRange: ", storeRange, "/ ",
      "FACILITY = ", "storeHours: ", storeHours, " ,storeRatings: ", storeRatings, " ,storeReviews: ", storeReviews, "/ ",
      "DETAILS = ", "storeContact: ", storeContact
      );




    const glyphCopy = `
      <svg
        class="glyph-action-copy"
        width="17"
        height="11"
        viewBox="0 0 17 11"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M4 1.28467V7.03467H4.95996V8.03467H4H3V7.03467V1.28467V0.284668H4H9.75H10.75V1.28467V2.25H9.75V1.28467H4ZM6.95996 4.25V10H12.71V4.25H6.95996ZM13.71 11H12.71H6.95996H5.95996V10V4.25V3.25H6.95996H12.71H13.71V4.25V10V11Z"
          fill="black"
        />
      </svg>
    `;

    const glyphOpen = `
    <svg
      class="glyph"
      width="8"
      height="11"
      viewBox="0 0 8 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M1.4878 11.0005L1.48744 11.0009L0.25 9.76343L5.03858 4.97485H0.252237V4.97461H0.25126V3.22461H7.15126H8.02626V3.22485H8.02724V4.09985V10.9999H6.27724V10.9996H6.27626V6.21327L1.48841 11.0011L1.4878 11.0005Z"
        fill="black"
      />
    </svg>
  `;


  const iconRatingStar = `
    <div class="indicator">
      <svg
        class="glyph"
        width="13"
        height="11"
        viewBox="0 0 13 11"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M6.50079 0C6.85472 0 7.17796 0.200921 7.33462 0.518292L8.60329 3.08848L11.4405 3.50318C11.7907 3.55436 12.0814 3.79985 12.1906 4.13648C12.2997 4.4731 12.2083 4.8425 11.9548 5.08941L9.90259 7.0883L10.3869 9.91224C10.4468 10.2611 10.3033 10.6137 10.017 10.8218C9.73057 11.0298 9.35091 11.0572 9.03762 10.8924L6.50079 9.55835L3.96395 10.8924C3.65066 11.0572 3.271 11.0298 2.98462 10.8218C2.69823 10.6137 2.5548 10.2611 2.61464 9.91224L3.09898 7.0883L1.04673 5.08941C0.793223 4.8425 0.70184 4.4731 0.810987 4.13648C0.813465 4.12884 0.816036 4.12124 0.818699 4.1137L0.765847 4.06222L0.843466 4.05088C0.971102 3.75866 1.24131 3.54991 1.56105 3.50318L4.39828 3.08848L5.66695 0.518292C5.80057 0.247598 6.05538 0.06162 6.34705 0.0127697L6.35325 0.00019455L6.35855 0.0109177C6.40517 0.00370987 6.45269 0 6.50079 0Z"
          fill="#101011"
        />
      </svg>
    </div>
    `;


    const buttonText = (text) => {
      return `
        <button class="title">
          <span class="text">
            <span class="text03">
              ${text}
            </span>
            ${glyphCopy}
          </span>
        </button>
      `
    };

    const titleLogo = (brand) => {
      return `
        <div class="title">
            <img class="logo-source-${brand}" src="logo-source-${brand}"" />
            <span class="text03">
              ${brand}
            </span>
        </div>
      `
    };

    const buttonItem = (brand, link) => {
      return `
      <a href="${link}" class="item">
        <div class="title">
            <img class="logo-source-${brand}" src="logo-source-${brand}"" />
          <span class="text03">
            ${brand}
          </span>
        </div>        
        ${glyphOpen}
      </a>`
      };

    const buttonLink = (text, link) => {
      return `
        <a href="${link}" class="button">
          <span class="text03">
            ${text}
          </span>
          ${glyphOpen}
        </a>`
    };



    const location = `
      <details class="store-location">
        <summary class="item">
            <div class="title">
                <div class="collapse">
                    <svg class="expand" width="11" height="6" viewBox="0 0 11 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M4.88162 -0.265227L0.470703 4.14544L1.70811 5.38292L5.5003 1.59093L9.29227 5.3829L10.5297 4.14546L6.11904 -0.26521L5.50034 -0.883911L4.88162 -0.265227Z" fill="#101011" />
                    </svg>
                </div>
                <div class="text">
                    <div class="old-town-in-placentia">
                        <span><span class="old-town-in-placentia-span">Old Town</span><span class="old-town-in-placentia-span2"> in </span><span class="old-town-in-placentia-span3">Placentia</span></span>
                    </div>
                </div>
            </div>
            <div class="indicator">
                <div class="_93-recommended"> Nearby </div>
            </div>
        </summary>
        <div class="details">
            <div class="header">
              <div class="thumbnail">
                  <div class="img">
                  </div>
                  <div class="cta">
                      <div class="frame-22446">
                          <div class="street-view"> Street View </div><svg class="glyph-link" width="8" height="11" viewBox="0 0 8 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path fill-rule="evenodd" clip-rule="evenodd" d="M6.27626 6.21217L1.48744 11.001L1.39844 10.912L1.39807 10.9124L0.337412 9.8517L0.337778 9.85133L0.25 9.76355L5.03882 4.97473H0.25126V4.84949H0.250284V3.34949H0.25126V3.22473H7.15126H8.02626V4.09973V10.9997H6.27626V6.21217Z" fill="black" />
                          </svg>
                      </div>
                  </div>
              </div>
              <div class="title2">
                  <div class="title3">
                      <svg class="icon-map-pin" width="9" height="15" viewBox="0 0 9 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M5.88627 7.68216L4.03755 10.2184L2.18899 7.68222C1.52542 6.77181 1.62346 5.51378 2.42009 4.71714C3.31346 3.82378 4.76189 3.82378 5.65523 4.71712C6.45185 5.51374 6.54988 6.77177 5.88627 7.68216ZM7.30045 8.71299C8.47172 7.10613 8.2987 4.88572 6.89267 3.47969C5.3159 1.90292 2.75943 1.90294 1.18265 3.47971C-0.223366 4.88573 -0.396429 7.10613 0.774783 8.713L3.6806 12.6997C3.857 12.9417 4.21802 12.9417 4.39442 12.6997L7.30045 8.71299Z" fill="#101011" />
                      </svg>
                      <div class="text2">
                          <div class="_109-w-santa-fe-ave-placentia"> 109 W Santa Fe Ave, Placentia </div>
                      </div>
                  </div>
                  <div class="frame-22445">
                      <div class="copy"> Copy </div><svg class="glyph-action-copy" width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path fill-rule="evenodd" clip-rule="evenodd" d="M1.74902 1.75464V8.03467H0.289062V6.53467V1.78467V0.284668H1.78906H6.53906H8.03906V1.75464H1.74902ZM4.74902 4.75V9.5H9.49902V4.75H4.74902ZM10.999 11H9.49902H4.74902H3.24902V9.5V4.75V3.25H4.74902H9.49902H10.999V4.75V9.5V11Z" fill="black" />
                      </svg>
                  </div>
              </div>
            </div><svg class="divider" width="285" height="2" viewBox="0 0 285 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 1H285" stroke="#D8E1E3" />
            </svg>
            <div class="section">
                <div class="item2">
                    <div class="title4">
                        <div class="text2">
                            <div class="currently-60-f-light-rain"> Currently 60°F, Light Rain </div>
                        </div>
                    </div>
                </div><svg class="divider2" width="255" height="2" viewBox="0 0 255 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 1H255" stroke="#D8E1E3" />
                </svg>
                <div class="item2">
                    <div class="title4">
                        <div class="text2">
                            <div class="free-parking-available"> Free Parking Available </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </details>`
    ;








      const header = `
      <div class="header">
        <div class="title">
          <div class="span">
            <div class="golden-state-coffee">Golden State Coffee</div>
          </div>
          <div class="logo">
            <div
              class="ca-cerritos-southwest-cerritos-smoking-tiger-bread-factory-logo-white"
            ></div>
          </div>
        </div>
        <div class="subtitle">
          <div class="remote-work-open-late-coffee-pastry">
            RemoteWork, Open Late, Coffee &amp; Pastry
          </div>
        </div>
        <div class="actions">
          <button class="button">
            <span class="text03 bold">
              Send to phone
            </span>
          </button>
          <button class="button">
            <span class="text03 bold">
              Call Business
            </span>
          </button>
        </div>
      </div>
      `;

      const accordion = `
      <details class="store-details">
        <summary class="item">
          <div class="title">
            <div class="collapse">
              <svg
                class="expand"
                width="11"
                height="6"
                viewBox="0 0 11 6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M4.88162 -0.265105L0.470703 4.14557L1.70811 5.38304L5.5003 1.59105L9.29227 5.38302L10.5297 4.14558L6.11904 -0.265088L5.50034 -0.883789L4.88162 -0.265105Z"
                  fill="#101011"
                />
              </svg>
            </div>
            <div class="text">
              <div class="coffee-shop-bakery">Coffee Shop &amp; Bakery</div>
            </div>
          </div>
          <div class="indicator">
            <div class="_93-recommended">$15 / Visit</div>
          </div>
        </summary>
        <div class="details">
          <div class="section">
            <div class="item">   
              ${buttonText('(714)646-9652')}
              ${buttonLink('Call', 'tel:7146469652')}
            </div>
            ${element.lineH.render(0)}
            <div class="item">   
              ${buttonText('roaster@goldenstate.coffee')}
              ${buttonLink('Email', 'roaster@goldenstate.coffee')}
            </div>
            ${element.lineH.render(0)}
            <div class="item">   
              ${buttonText('goldenstate.coffee')}
              ${buttonLink('Open', 'www.goldenstate.coffee')}
            </div>
            ${element.lineH.render(0)}
              <svg
              class="divider2"
              width="255"
              height="2"
              viewBox="0 0 255 2"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 1H255" stroke="#D8E1E3" />
            </svg>
            <div class="item2">
              <div class="title">
                <div class="text3">
                  <div class="goldenstate-coffee">goldenstate.coffee</div>
                  <svg
                    class="glyph-action-copy3"
                    width="17"
                    height="11"
                    viewBox="0 0 17 11"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M4 1.28467V7.03467H4.95996V8.03467H4H3V7.03467V1.28467V0.284668H4H9.75H10.75V1.28467V2.25H9.75V1.28467H4ZM6.95996 4.25V10H12.71V4.25H6.95996ZM13.71 11H12.71H6.95996H5.95996V10V4.25V3.25H6.95996H12.71H13.71V4.25V10V11Z"
                      fill="black"
                    />
                  </svg>
                </div>
              </div>
              <div class="button">
                <span class="text03">
                  Open
                </span>
                <svg
                  class="glyph3"
                  width="8"
                  height="11"
                  viewBox="0 0 8 11"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M1.4878 11.0005L1.48744 11.0009L0.25 9.76343L5.03858 4.97485H0.252237V4.97461H0.25126V3.22461H7.15126H8.02626V3.22485H8.02724V4.09985V10.9999H6.27724V10.9996H6.27626V6.21327L1.48841 11.0011L1.4878 11.0005Z"
                    fill="black"
                  />
                </svg>
              </div>
            </div>
            <svg
              class="divider3"
              width="255"
              height="2"
              viewBox="0 0 255 2"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 1H255" stroke="#D8E1E3" />
            </svg>



            <details class="other-links">
              <summary class="cta-expand">
                <div class="cta-expand-regular">
                  <div class="text4">
                    <div class="other-links">Other Links</div>
                  </div>
                  <svg
                    class="glyph-action-expand-r-inactive"
                    width="11"
                    height="11"
                    viewBox="0 0 11 11"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10.8545 4.93237L10.8545 6.35737L0.144531 6.35737L0.144531 4.93237L10.8545 4.93237Z"
                      fill="#12120F"
                    />
                  </svg>
                </div>
              </summary>
              <div class="section2">

             
                ${buttonItem('infatuated', 'https://www.google.com/search?q=Golden State Coffee')}
                ${buttonItem('instagram', 'https://www.google.com/search?q=Golden State Coffee')}
                ${buttonItem('facebook', 'https://www.google.com/search?q=Golden State Coffee')}
                ${buttonItem('google', 'https://www.google.com/search?q=Golden State Coffee')}
                ${buttonItem('yelp', 'https://www.google.com/search?q=Golden State Coffee')}
            
                
              </div>
            </details>
          </div>
        </div>
      </div>
      `;

      const facility = `
      <details class="store-facilty">
        <summary class="item">
          <div class="title">
            <div class="collapse">
              <svg
                class="expand"
                width="11"
                height="6"
                viewBox="0 0 11 6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M4.88162 -0.265227L0.470703 4.14544L1.70811 5.38292L5.5003 1.59093L9.29227 5.3829L10.5297 4.14546L6.11904 -0.26521L5.50034 -0.883911L4.88162 -0.265227Z"
                  fill="#101011"
                />
              </svg>
            </div>
            <div class="text">
              <div class="open">Open</div>
              <div class="until">
                <span>
                  <span class="until-span"></span>
                  <span class="until-span2">until</span>
                </span>
              </div>
              <div class="_6-pm">6PM</div>
            </div>
          </div>
          <div class="indicator">
            <div class="_93-recommended">Currently Busy</div>
          </div>
        </summary>
        <div class="details">
          <div class="section">
            <div class="item">
              <div class="title">
                <svg
                  class="symbol-s"
                  width="18"
                  height="15"
                  viewBox="0 0 18 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="18" height="15" rx="3" fill="#101011" />
                  <path
                    d="M7.21899 8.94594C7.21899 9.23394 7.27099 9.47794 7.37499 9.67794C7.47899 9.87794 7.61499 10.0419 7.78299 10.1699C7.95899 10.2899 8.16299 10.3819 8.39499 10.4459C8.62699 10.5019 8.86699 10.5299 9.11499 10.5299C9.28299 10.5299 9.46299 10.5179 9.65499 10.4939C9.84699 10.4619 10.027 10.4059 10.195 10.3259C10.363 10.2459 10.503 10.1379 10.615 10.0019C10.727 9.85794 10.783 9.67794 10.783 9.46194C10.783 9.22994 10.707 9.04194 10.555 8.89794C10.411 8.75394 10.219 8.63394 9.97899 8.53794C9.73899 8.44194 9.46699 8.35794 9.16299 8.28594C8.85899 8.21394 8.55099 8.13394 8.23899 8.04594C7.91899 7.96594 7.60699 7.86994 7.30299 7.75794C6.99899 7.63794 6.72699 7.48594 6.48699 7.30194C6.24699 7.11794 6.05099 6.88994 5.89899 6.61794C5.75499 6.33794 5.68299 6.00194 5.68299 5.60994C5.68299 5.16994 5.77499 4.78994 5.95899 4.46994C6.15099 4.14194 6.39899 3.86994 6.70299 3.65394C7.00699 3.43794 7.35099 3.27794 7.73499 3.17394C8.11899 3.06994 8.50299 3.01794 8.88699 3.01794C9.33499 3.01794 9.76299 3.06994 10.171 3.17394C10.587 3.26994 10.955 3.42994 11.275 3.65394C11.595 3.87794 11.847 4.16594 12.031 4.51794C12.223 4.86194 12.319 5.28194 12.319 5.77794H10.495C10.479 5.52194 10.423 5.30994 10.327 5.14194C10.239 4.97394 10.119 4.84194 9.96699 4.74594C9.81499 4.64994 9.63899 4.58194 9.43899 4.54194C9.24699 4.50194 9.03499 4.48194 8.80299 4.48194C8.65099 4.48194 8.49899 4.49794 8.34699 4.52994C8.19499 4.56194 8.05499 4.61794 7.92699 4.69794C7.80699 4.77794 7.70699 4.87794 7.62699 4.99794C7.54699 5.11794 7.50699 5.26994 7.50699 5.45394C7.50699 5.62194 7.53899 5.75794 7.60299 5.86194C7.66699 5.96594 7.79099 6.06194 7.97499 6.14994C8.16699 6.23794 8.42699 6.32594 8.75499 6.41394C9.09099 6.50194 9.52699 6.61394 10.063 6.74994C10.223 6.78194 10.443 6.84194 10.723 6.92994C11.011 7.00994 11.295 7.14194 11.575 7.32594C11.855 7.50994 12.095 7.75794 12.295 8.06994C12.503 8.37394 12.607 8.76594 12.607 9.24594C12.607 9.63794 12.531 10.0019 12.379 10.3379C12.227 10.6739 11.999 10.9659 11.695 11.2139C11.399 11.4539 11.027 11.6419 10.579 11.7779C10.139 11.9139 9.62699 11.9819 9.04299 11.9819C8.57099 11.9819 8.11099 11.9219 7.66299 11.8019C7.22299 11.6899 6.83099 11.5099 6.48699 11.2619C6.15099 11.0139 5.88299 10.6979 5.68299 10.3139C5.48299 9.92994 5.38699 9.47394 5.39499 8.94594H7.21899Z"
                    fill="white"
                  />
                </svg>
                <div class="text">
                  <div class="_8-am">8AM</div>
                  <div class="to">to</div>
                  <div class="_6-pm">6PM</div>
                </div>
              </div>
              <div class="indicator">
                <div class="_93-recommended">Packed</div>
              </div>
            </div>
            <div class="item">
              <div class="title">
                <svg
                  class="symbol-s2"
                  width="18"
                  height="15"
                  viewBox="0 0 18 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="18" height="15" rx="3" fill="#101011" />
                  <path
                    d="M4.38672 3.21594H7.03872L9.04272 9.10794H9.06672L10.9627 3.21594H13.6147V11.7839H11.8507V5.71194H11.8267L9.72672 11.7839H8.27472L6.17472 5.77194H6.15072V11.7839H4.38672V3.21594Z"
                    fill="white"
                  />
                </svg>
                <div class="text">
                  <div class="_8-am">8AM</div>
                  <div class="to">to</div>
                  <div class="_6-pm">6PM</div>
                </div>
              </div>
              <div class="indicator2">
                <div class="_93-recommended">Moderate</div>
              </div>
            </div>
            <div class="item">
              <div class="title">
                <svg
                  class="symbol-s3"
                  width="18"
                  height="15"
                  viewBox="0 0 18 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="18" height="15" rx="3" fill="#101011" />
                  <path
                    d="M8.05823 4.79994H5.49023V3.21594H12.5102V4.79994H9.94223V11.7839H8.05823V4.79994Z"
                    fill="white"
                  />
                </svg>
                <div class="text">
                  <div class="_8-am">8AM</div>
                  <div class="to">to</div>
                  <div class="_6-pm">6PM</div>
                </div>
              </div>
              <div class="indicator3">
                <div class="_93-recommended">Not Busy</div>
              </div>
            </div>
            <div class="item">
              <div class="title">
                <svg
                  class="symbol-s4"
                  width="18"
                  height="15"
                  viewBox="0 0 18 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="18" height="15" rx="3" fill="#101011" />
                  <path
                    d="M12.3231 11.7839H10.4511L8.99909 5.95194H8.97509L7.54709 11.7839H5.63909L3.37109 3.21594H5.25509L6.61109 9.04794H6.63509L8.12309 3.21594H9.88709L11.3511 9.11994H11.3751L12.7791 3.21594H14.6271L12.3231 11.7839Z"
                    fill="white"
                  />
                </svg>
                <div class="text">
                  <div class="_8-am">8AM</div>
                  <div class="to">to</div>
                  <div class="_6-pm">6PM</div>
                </div>
              </div>
              <div class="indicator3">
                <div class="_93-recommended">Not Busy</div>
              </div>
            </div>
            <div class="item">
              <div class="title">
                <svg
                  class="symbol-s5"
                  width="18"
                  height="15"
                  viewBox="0 0 18 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="18" height="15" rx="3" fill="#101011" />
                  <path
                    d="M8.05823 4.79994H5.49023V3.21594H12.5102V4.79994H9.94223V11.7839H8.05823V4.79994Z"
                    fill="white"
                  />
                </svg>
                <div class="text">
                  <div class="_8-am">8AM</div>
                  <div class="to">to</div>
                  <div class="_6-pm">6PM</div>
                </div>
              </div>
              <div class="indicator3">
                <div class="_93-recommended">Not Busy</div>
              </div>
            </div>
            <div class="item">
              <div class="title">
                <svg
                  class="symbol-s6"
                  width="18"
                  height="15"
                  viewBox="0 0 18 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="18" height="15" rx="3" fill="#101011" />
                  <path
                    d="M5.98828 3.21594H12.0123V4.79994H7.87228V6.77994H11.4603V8.24394H7.87228V11.7839H5.98828V3.21594Z"
                    fill="white"
                  />
                </svg>
                <div class="text">
                  <div class="_8-am">8AM</div>
                  <div class="to">to</div>
                  <div class="_6-pm">6PM</div>
                </div>
              </div>
              <div class="indicator">
                <div class="_93-recommended">Packed</div>
              </div>
            </div>
            <div class="item">
              <div class="title">
                <svg
                  class="symbol-s7"
                  width="18"
                  height="15"
                  viewBox="0 0 18 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="18" height="15" rx="3" fill="#101011" />
                  <path
                    d="M7.21899 8.94594C7.21899 9.23394 7.27099 9.47794 7.37499 9.67794C7.47899 9.87794 7.61499 10.0419 7.78299 10.1699C7.95899 10.2899 8.16299 10.3819 8.39499 10.4459C8.62699 10.5019 8.86699 10.5299 9.11499 10.5299C9.28299 10.5299 9.46299 10.5179 9.65499 10.4939C9.84699 10.4619 10.027 10.4059 10.195 10.3259C10.363 10.2459 10.503 10.1379 10.615 10.0019C10.727 9.85794 10.783 9.67794 10.783 9.46194C10.783 9.22994 10.707 9.04194 10.555 8.89794C10.411 8.75394 10.219 8.63394 9.97899 8.53794C9.73899 8.44194 9.46699 8.35794 9.16299 8.28594C8.85899 8.21394 8.55099 8.13394 8.23899 8.04594C7.91899 7.96594 7.60699 7.86994 7.30299 7.75794C6.99899 7.63794 6.72699 7.48594 6.48699 7.30194C6.24699 7.11794 6.05099 6.88994 5.89899 6.61794C5.75499 6.33794 5.68299 6.00194 5.68299 5.60994C5.68299 5.16994 5.77499 4.78994 5.95899 4.46994C6.15099 4.14194 6.39899 3.86994 6.70299 3.65394C7.00699 3.43794 7.35099 3.27794 7.73499 3.17394C8.11899 3.06994 8.50299 3.01794 8.88699 3.01794C9.33499 3.01794 9.76299 3.06994 10.171 3.17394C10.587 3.26994 10.955 3.42994 11.275 3.65394C11.595 3.87794 11.847 4.16594 12.031 4.51794C12.223 4.86194 12.319 5.28194 12.319 5.77794H10.495C10.479 5.52194 10.423 5.30994 10.327 5.14194C10.239 4.97394 10.119 4.84194 9.96699 4.74594C9.81499 4.64994 9.63899 4.58194 9.43899 4.54194C9.24699 4.50194 9.03499 4.48194 8.80299 4.48194C8.65099 4.48194 8.49899 4.49794 8.34699 4.52994C8.19499 4.56194 8.05499 4.61794 7.92699 4.69794C7.80699 4.77794 7.70699 4.87794 7.62699 4.99794C7.54699 5.11794 7.50699 5.26994 7.50699 5.45394C7.50699 5.62194 7.53899 5.75794 7.60299 5.86194C7.66699 5.96594 7.79099 6.06194 7.97499 6.14994C8.16699 6.23794 8.42699 6.32594 8.75499 6.41394C9.09099 6.50194 9.52699 6.61394 10.063 6.74994C10.223 6.78194 10.443 6.84194 10.723 6.92994C11.011 7.00994 11.295 7.14194 11.575 7.32594C11.855 7.50994 12.095 7.75794 12.295 8.06994C12.503 8.37394 12.607 8.76594 12.607 9.24594C12.607 9.63794 12.531 10.0019 12.379 10.3379C12.227 10.6739 11.999 10.9659 11.695 11.2139C11.399 11.4539 11.027 11.6419 10.579 11.7779C10.139 11.9139 9.62699 11.9819 9.04299 11.9819C8.57099 11.9819 8.11099 11.9219 7.66299 11.8019C7.22299 11.6899 6.83099 11.5099 6.48699 11.2619C6.15099 11.0139 5.88299 10.6979 5.68299 10.3139C5.48299 9.92994 5.38699 9.47394 5.39499 8.94594H7.21899Z"
                    fill="white"
                  />
                </svg>
                <div class="text">
                  <div class="_8-am">8AM</div>
                  <div class="to">to</div>
                  <div class="_6-pm">6PM</div>
                </div>
              </div>
              <div class="indicator">
                <div class="_93-recommended">Packed</div>
              </div>
            </div>
            <svg
              class="divider"
              width="261"
              height="2"
              viewBox="0 0 261 2"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 1H261" stroke="#D8E1E3" />
            </svg>
            <svg
              class="divider2"
              width="261"
              height="2"
              viewBox="0 0 261 2"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 1H261" stroke="#D8E1E3" />
            </svg>
            <svg
              class="divider3"
              width="261"
              height="2"
              viewBox="0 0 261 2"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 1H261" stroke="#D8E1E3" />
            </svg>
            <svg
              class="divider4"
              width="261"
              height="2"
              viewBox="0 0 261 2"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 1H261" stroke="#D8E1E3" />
            </svg>
            <svg
              class="divider5"
              width="261"
              height="2"
              viewBox="0 0 261 2"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 1H261" stroke="#D8E1E3" />
            </svg>
            <svg
              class="divider6"
              width="261"
              height="2"
              viewBox="0 0 261 2"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 1H261" stroke="#D8E1E3" />
            </svg>
          </div>
        </div>
      </details>
      `;  


      const reviews = `
      <details class="store-rating">
        <summary class="item">
          <div class="title">
            <div class="expand">
              <svg
                class="expand2"
                width="11"
                height="6"
                viewBox="0 0 11 6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M4.88162 5.38301L0.470703 0.972335L1.70811 -0.265137L5.5003 3.52685L9.29227 -0.265119L10.5297 0.972317L6.11904 5.38299L5.50034 6.00169L4.88162 5.38301Z"
                  fill="#101011"
                />
              </svg>
            </div>
            <div class="text">
              <div class="_0-00">0.00</div>
              <div class="i">
                <svg
                  class="glyph-rating-star"
                  width="11"
                  height="15"
                  viewBox="0 0 11 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.47124 2.57861L7.16186 6.00359L10.9425 6.55619L8.20686 9.22067L8.85247 12.9849L5.47124 11.2067L2.09001 12.9849L2.73562 9.22067L0 6.55619L3.78063 6.00359L5.47124 2.57861Z"
                    fill="#FEDF72"
                  />
                </svg>
              </div>
              <div class="_333">333</div>
              <div class="reviews">Reviews</div>
            </div>
          </div>
          <div class="indicator">
            <div class="_93-recommended">Popular</div>
          </div>
        </summary>
        <div class="details">
          <div class="section">
            <div class="item2">
              <div class="title2">
                <img class="icon" src="icon0.png" />
                <div class="text">
                  <div class="_0-00">0.00</div>
                  <div class="icon2">
                    <svg
                      class="glyph-rating-star2"
                      width="11"
                      height="15"
                      viewBox="0 0 11 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5.47124 2.57861L7.16186 6.00359L10.9425 6.55619L8.20686 9.22067L8.85247 12.9849L5.47124 11.2067L2.09001 12.9849L2.73562 9.22067L0 6.55619L3.78063 6.00359L5.47124 2.57861Z"
                        fill="#FEDF72"
                      />
                    </svg>
                  </div>
                  <div class="_300">300</div>
                  <div class="reviews">Reviews</div>
                </div>
              </div>
              <div class="frame-22445">
                <div class="google">Google</div>
                <svg
                  class="glyph-link"
                  width="8"
                  height="11"
                  viewBox="0 0 8 11"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M1.4878 11.0004L1.48744 11.0007L0.25 9.76331L5.03858 4.97473H0.252237V4.97449H0.25126V3.22449H7.15126H8.02626V3.22473H8.02724V4.09973V10.9997H6.27724V10.9995H6.27626V6.21315L1.48841 11.001L1.4878 11.0004Z"
                    fill="black"
                  />
                </svg>
              </div>
            </div>
            <svg
              class="divider"
              width="261"
              height="2"
              viewBox="0 0 261 2"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0 1H261" stroke="#D8E1E3" />
            </svg>
            <div class="item2">
              <div class="title2">
                <img class="icon" src="icon2.png" />
                <div class="text">
                  <div class="_0-00">0.00</div>
                  <div class="icon2">
                    <svg
                      class="glyph-rating-star3"
                      width="11"
                      height="15"
                      viewBox="0 0 11 15"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5.47124 2.57861L7.16186 6.00359L10.9425 6.55619L8.20686 9.22067L8.85247 12.9849L5.47124 11.2067L2.09001 12.9849L2.73562 9.22067L0 6.55619L3.78063 6.00359L5.47124 2.57861Z"
                        fill="#FEDF72"
                      />
                    </svg>
                  </div>
                  <div class="_33">33</div>
                  <div class="reviews">Reviews</div>
                </div>
              </div>
              <div class="frame-22446">
                <div class="yelp">Yelp</div>
                <svg
                  class="glyph-link2"
                  width="8"
                  height="11"
                  viewBox="0 0 8 11"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M1.4878 11.0004L1.48744 11.0007L0.25 9.76331L5.03858 4.97473H0.252237V4.97449H0.25126V3.22449H7.15126H8.02626V3.22473H8.02724V4.09973V10.9997H6.27724V10.9995H6.27626V6.21315L1.48841 11.001L1.4878 11.0004Z"
                    fill="black"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </details>
      `;  
      







      const related = `
      <div class="related">
        <div class="neumetal">
          ${neustarAward}
        </div>
        <div class="card-header">
          <div
            class="smoking-tiger-coffee-bread-cerritos-korean-roots-defining-the-modern-coffee"
          >
            Smoking Tiger Coffee &amp; Bread Cerritos Korean Roots &amp; defining the
            modern coffee
          </div>
        </div>
      </div>
      `;




      
        return `


          <div class="panel">
            ${header}
            ${element.lineH.render(0)}
            ${accordion}
            ${element.lineH.render(0)}
            ${location}
            ${element.lineH.render(0)}
            ${facility}
            ${element.lineH.render(0)}
            ${reviews}
            ${element.lineH.render(30)}
            ${related}
          </div>
          
 

        `;

    }

}

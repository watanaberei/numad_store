import * as accordion from '../accordion/accordion.js';


export const storeDetails = {
    render: (store) => {
      console.log('[Sidebar.js] storeHero rendering with data:', store)
    //   const { name, address, phone, hours, price, rating, reviews, distance, tags } = store;
    const storeName = store.name;
    const storeOverview = {
        name: store.storeName,
        city: store.city,
        state: store.state,
        status: store.status,
        storeType: store.storeType || [],
        // storeTypeShort: storeType.alias,
        // storeTypeTitle: storeType.title,
        cost: store.costEstimate,
        distance: store.distance,
        gallery: store.mediaGallery || [],
        price: store.priceEstimate,
        rating: store.rating,
        review: store.review_count,
        rating: store.rating,
        // phone: store.phone,
        // hours: store.hours,
        // price: store.price,
        // rating: store.rating,
        // reviews: store.reviews,
        // distance: store.distance,
        // tags: store.tags,
    }
    console.log('[Sidebar.js] storeOverview:', storeOverview)
    let isOpen = false;
    if (storeOverview.status === "Open") {
        isOpen = true
    } else {
        isOpen = false
    }

    
// city:"Long Beach"
// cost:"$9-12"
// distance:"3.3mi"
// gallery:[]
// name:"The Library"
// price:undefined
// rating:3.8
// review:843
// state:"CA"
// status:"Open"
// storeType:Array(1)
// 0:{alias: 'coffee', title: 'Coffee & Tea'}
// length:1
    const overviewData =  {
        title: storeOverview.name,
        subtitle: storeOverview.city + ", " + storeOverview.state,
        status: storeOverview.status,
        content: {
            title: storeOverview.name,
            content: "<p>Content for section 1</p>"
        },
        isOpen: isOpen
    }
    const experienceData =  {
        title: storeOverview.name,
        subtitle: storeOverview.alias + ", " + storeOverview.title,
        tag: storeOverview.cost,
        content: {
            title: storeOverview.name,
            content: "<p>Content for section 1</p>"
        },
        isOpen: isOpen
    }
    const serviceData =  {
        title: storeOverview.name,
        subtitle: storeOverview.rating + " " + storeOverview.review,
        tag: "popular",
        content: {
            title: storeOverview.name,
            content: "<p>Content for section 1</p>"
        },
        isOpen: isOpen
    }
    const businessData =  {
        title: storeOverview.name,
        subtitle: storeOverview.status,
        content: {
            title: "Price: " + storeOverview.cost,
            content: "<p>Content for section 1</p>"
        },
        isOpen: isOpen
    }

    const accordionData = {
        sections: [
          {
            section: overviewData,
          },
          {
            section: experienceData,
          },
          {
            section: serviceData,
          },
          {
            section: businessData,
          },
        ]
      };
      
      const accordionHTML = accordion.Details.render(accordionData);
   
      
      
     return `
      <div class="store-details col01">
        <div id="accordion-container">
          ${accordionHTML}
        </div>

    <div class="store-details col01">
        <div class="header">
            <div class="text" data-class="text02">
                <span class="smoking-tiger-bread-factory">
                    ${storeOverview.name}
                </span>
            </div>
            
            <button class="icon-action-options" data-class="icon-options" id="options">
            <div class="options">
                <div class="ellipse-351"></div>
                <div class="ellipse-352"></div>
                <div class="ellipse-353"></div>
            </div>
            </button>
        </div>
        <div class="media">
            <div class="media-container" data-class="media-container">
            <div
                class="img"
                style="
                background: url(img0.png) center;
                background-size: contain;
                background-repeat: no-repeat;
                "
            >
                <div class="frame-24797">
                <div class="aspect-ratio">
                    <div class="aspect-ratio-lock-30"></div>
                </div>
                <div class="aspect-ratio">
                    <div class="aspect-ratio-lock-30"></div>
                </div>
                </div>
            </div>
            </div>
        </div>
        <div class="actions">
            <button class="button" data-class="primary" id="sharePhone">
            <div class="span">
                <div class="send-to-phone">Send to phone</div>
            </div>
            </button>
            <button class="button" id="sharePhone" data-class="primary">
            <div class="span2">
                <div class="call-business">Call Business</div>
            </div>
            </button>
        </div>
        <div class="divider-component" data-class="dividerComponent">
            <div class="rule-h"></div>
        </div>
        <div class="info">
            <div class="facility">
            <div class="title">
                <span class="label" id="detail-hours" data-class="text02">
                Open until 6pm
                </span>
                <button class="tag" data-class="tag geoclass">
                <div class="key" data-class="geoclass">
                    <span class="text2" data-class="text02">8am</span>
                    <span class="text2" data-class="text02">-</span>
                    <span class="text2" data-class="text02">9pm</span>
                </div>
                </button>
            </div>
            <div class="button2">
                <svg
                class="expand"
                width="10"
                height="7"
                viewBox="0 0 10 7"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                >
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M4.23123 5.81806L-0.179688 1.40739L1.05771 0.169922L4.84991 3.96191L8.64188 0.169939L9.87932 1.40738L5.46865 5.81805L4.84995 6.43675L4.23123 5.81806Z"
                    fill="#272727"
                />
                </svg>
            </div>
            </div>
            <div class="divider-component" data-class="dividerComponent">
            <div class="rule-h"></div>
            </div>
            <div class="details2">
            <div class="title">
                <span class="label" id="detail-hours" data-class="text02">
                Coffee &amp; Tea, Pastries
                </span>
                <button class="tag" data-class="tag geoclass">
                <div class="key2" data-class="geoclass">
                    <span class="text2" data-class="text02">Price:</span>
                    <span class="text2" data-class="text02">$$</span>
                </div>
                </button>
            </div>
            <div class="button2">
                <svg
                class="expand2"
                width="10"
                height="7"
                viewBox="0 0 10 7"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                >
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M4.23123 5.81806L-0.179688 1.40739L1.05771 0.169922L4.84991 3.96191L8.64188 0.169939L9.87932 1.40738L5.46865 5.81805L4.84995 6.43675L4.23123 5.81806Z"
                    fill="#272727"
                />
                </svg>
            </div>
            </div>
            <div class="divider-component" data-class="dividerComponent">
            <div class="rule-h"></div>
            </div>
            <div class="location">
            <div class="title">
                <div class="sentance">
                <div class="primary">
                    <div class="label">0.00</div>
                    <svg
                    class="icon-rating-star"
                    width="13"
                    height="12"
                    viewBox="0 0 13 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    >
                    <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M7.02597 0.703187C6.89962 0.44721 6.6389 0.285156 6.35344 0.285156C6.06798 0.285156 5.80727 0.44721 5.68091 0.703187L4.25294 3.59608L1.05952 4.06285C0.777099 4.10413 0.542589 4.30213 0.454556 4.57364C0.366523 4.84514 0.440228 5.14308 0.644692 5.34223L2.95482 7.59229L2.40963 10.7711C2.36136 11.0524 2.47705 11.3368 2.70803 11.5046C2.93901 11.6724 3.24523 11.6945 3.49792 11.5616L6.35344 10.06L9.20896 11.5616C9.46165 11.6945 9.76787 11.6724 9.99885 11.5046C10.2298 11.3368 10.3455 11.0524 10.2973 10.7711L9.75206 7.59229L12.0622 5.34223C12.2667 5.14308 12.3404 4.84514 12.2523 4.57364C12.1643 4.30213 11.9298 4.10413 11.6474 4.06285L8.45394 3.59608L7.02597 0.703187Z"
                        fill="#212322"
                    />
                    </svg>
                    <div class="reviews">,</div>
                </div>
                <div class="secondary">
                    <div class="label">333</div>
                    <div class="reviews">Reviews</div>
                </div>
                </div>
                <button class="tag" data-class="tag geoclass">
                <div class="key" data-class="geoclass">
                    <span class="text2" data-class="text02">Popular</span>
                </div>
                </button>
            </div>
            <div class="button2">
                <svg
                class="expand3"
                width="10"
                height="7"
                viewBox="0 0 10 7"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                >
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M4.23123 5.81806L-0.179688 1.40739L1.05771 0.169922L4.84991 3.96191L8.64188 0.169939L9.87932 1.40738L5.46865 5.81805L4.84995 6.43675L4.23123 5.81806Z"
                    fill="#272727"
                />
                </svg>
            </div>
            </div>
            <div class="divider-component" data-class="dividerComponent">
            <div class="rule-h"></div>
            </div>
            <div class="location">
            <div class="title">
                <div class="sentance">
                <div class="primary">
                    <div class="label">Old Town</div>
                    <div class="reviews">,</div>
                </div>
                <div class="secondary2">
                    <div class="label">Pasadena</div>
                </div>
                </div>
                <button class="tag" data-class="tag geoclass">
                <div class="key" data-class="geoclass">
                    <span class="text2" data-class="text02">8</span>
                    <span class="text2" data-class="text02">mi away</span>
                </div>
                </button>
            </div>
            <div class="button2">
                <svg
                class="expand4"
                width="10"
                height="7"
                viewBox="0 0 10 7"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                >
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M4.23123 5.81806L-0.179688 1.40739L1.05771 0.169922L4.84991 3.96191L8.64188 0.169939L9.87932 1.40738L5.46865 5.81805L4.84995 6.43675L4.23123 5.81806Z"
                    fill="#272727"
                />
                </svg>
            </div>
            </div>
        </div>
    </div>

      `;
    },      
    afterRender: () => {
        console.log('[Sidebar.js] afterRender - Setting up accordion event listeners');
        // document.querySelector('#accordion-container').innerHTML = accordionHTML;
        
        // Add event listeners to accordion headers
        const accordionHeaders = document.querySelectorAll('.accordion-header');
        console.log('[Sidebar.js] Found accordion headers:', accordionHeaders.length);
        
        accordionHeaders.forEach((header, index) => {
            console.log(`[Sidebar.js] Adding click listener to header ${index}`);
            header.addEventListener('click', (event) => {
                console.log(`[Sidebar.js] Header ${index} clicked`);
                event.preventDefault();
                event.stopPropagation();
                
                const section = header.parentElement.parentElement;
                const content = section.querySelector('.accordion-content');
                const isExpanded = header.getAttribute('aria-expanded') === 'true';
                const button = header.querySelector('.button2');
                
                console.log(`[Sidebar.js] Header ${index} state:`, {
                    isExpanded,
                    hasContent: !!content,
                    hasButton: !!button
                });

                // Toggle current section
                header.classList.toggle('active');
                header.setAttribute('aria-expanded', !isExpanded);
                content.hidden = isExpanded;
                
                // Rotate expand button
                if (button) {
                    button.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
                    console.log(`[Sidebar.js] Rotated button for header ${index}`);
                }
            });
        });

        accordion.Details.afterRender();
    }
}
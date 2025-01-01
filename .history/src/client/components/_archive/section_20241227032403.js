import { format, parseISO } from "date-fns";
import * as element from "./elements.js";
import { model } from "mongoose";
import * as modal from "./modal.js";
// import { modals } from "../components/modal";

// export const mediaHero = {
//     render: (hero) => {
//         const mediaPlatinum = element.mediaPlatinum.render(hero.mediaPlatinum);
//         // console.log("mediaPlatinum", mediaPlatinum);
//         const neustarAward = element.neustarAward.render(hero.neustar);
//         // console.log("neustarAward", neustarAward);
//         // const neustarAnchor = element.neustarAward.render(hero.neustarAnchor);
//         // console.log("neustarAnchor", neustarAnchor);
//         const button = element.buttonFloating.render(hero.buttonFloating);
//         // console.log("labelButton", button);

//         return `
//         `;
//     },
// };

export const section = {
    render: async (store) => {
    // const title = store.overviewTitle;
    const title = "What to expect";
    const snippet = store.snippetOverview;

    const areaNames = store.mediaArea;
    // const areaNames = store.mediaArea.description && Array.isArray(store.mediaArea.description) && store.mediaArea.description.length ? store.mediaArea.description : [];
    // console.log("areaNames", areaNames);
    const storeType = store.storeTypes;
    const storeCategories = store.storeCategory;
    const storeRanges = store.storeRange;

    // ATTRIBUTES
    // attributesBest attributesDetails attributesEnvironment attributesExperience attributesFacility attributesFoundation attributesNoise attributesOverview attributesParking attributesService attributesOverview(overview)
    const attributesFacility = store.attributesFacility;
    const attributesBest = store.storeAttributesBest;
    const attributesOverview = store.attributesOverview;

    // MEDIA
    const mediaGallery = store.mediaGallery || [];
    const mediaArea = store.mediaArea || [];
    // const initModal = modal.modals;

    //////////////////////////// SUMMARY ////////////////////////////
    // const limitedBest02 = store?.areaNames?.length
    //   ? store.areaNames.slice(0, 3)
    //   : [];
    // console.log("limitedBest02", limitedBest02);

    //   FACILITY
    let attributesFacilityHTML = "";
    attributesFacility.forEach((array) => {
      attributesFacilityHTML += `
            <div class="item"> 
                <a class="">
                    <span class="text03">
                        ${array.key}
                    </span>
                </a>
                <span class="text03 div">
                    ,
                </span>
            </div>
            `;
    });

    const limitedAttributeOverview04 = attributesOverview.slice(0, 4);

    // BEST
    let attributesOverviewHTML = "";
   
    limitedAttributeOverview04.forEach((attributesOverview) => {
        let iconString = attributesOverview.key.trim();
        iconString = iconString.charAt(0).toLowerCase() + iconString.slice(1).replace(/\s/g, '');
      attributesOverviewHTML += `
        <div class="item">
            <i class="section-tag-icon icon-${attributesOverview.key}-21"></i>
            <div class="text">
                <div class="title">
                    <span class="text03 bold">
                        ${attributesOverview.key}
                    </span>
                </div>
                <div class="array">
                    <a class="list-item">
                        <span class="text03">
                            ${attributesOverview.value}
                        </span>
                        <i class="glyph"></i>
                    </a>
                </div>
            </div>
        </div>
        `;
    });

    // document.addEventListener('DOMContentLoaded', () => {
    //     modals.init();
    //     // console.log("modals.init()", modals.init());
    //     // console.log("modals", modals);
    //   });



    const areaName = areaNames;
    function generateAttributesArray(areaName) {
      let attributesArray = "";
      areaName.forEach((best) => {
        attributesArray += `
            <div class="item">
                <a class="coffee-bar">
                    <span class="text03">
                        ${best.description}
                    </span>
                </a>
                <span class="text03 div">
                    ,
                </span>
            </div>
            `;
      });
      return attributesArray;
    }

    const attributesArray = generateAttributesArray(areaName);




    // ///////////////////////////////////////////////////////
    // //////////////////////// MODAL ////////////////////////
    // ///////////////////////////////////////////////////////
    const modalSectionData = {
        gallery: mediaGallery,
        area: mediaArea,
    }
    const modalSection = modal.modalGallery(modalSectionData);
    // const modalComponent = () => {
    //     const modalHTML = `
    //       <button id="myBtn">Open Modal</button>
    //       <div id="myModal" class="modal">
    //         <div class="modal-content">
    //           <span class="modal-close">&times;</span>
    //           <span class="header03">Some text in the Modal..</p>
    //         </div>
    //       </div>
    //     `;
      
    //     document.addEventListener('click', (event) => {
    //       if (event.target.matches('.modal-close') || event.target.matches('.modal')) {
    //         document.getElementById('myModal').style.display = 'none';
    //       } else if (event.target.matches('#myBtn')) {
    //         document.getElementById('myModal').style.display = 'block';
    //       }
    //     });
      
    //     return modalHTML;
    //   };
    // ///////////////////////////////////////////////////////
    // //////////////////////// MODAL ////////////////////////
    // ///////////////////////////////////////////////////////





    /////////////////////////////////////////////////////////
    //////////////////////// SNIPPET ////////////////////////
    /////////////////////////////////////////////////////////
    const limit = "270";
    const createOverviewText = (snippet, limit) => {
        const limits = limit;
        const fullText = snippet; // The full text to display
        const limitedText = snippet.length >limit ? snippet.substring(0, limit) + '...' : snippet; // Limited text
        const overviewHTML = `
            <div id="overview-text-container" class="body">
                <div id="overview-text" class="container">
                    <span id="snippet-text" class="text text03">
                        ${limitedText}
                    </span>
                    <span id="toggle-text" class="text text03 button-more">
                        Show More
                    </span>
                </div>
            </div>
        `;
    
        // Attach this HTML to the DOM as appropriate for your application
    
        document.addEventListener('click', (event) => {
            if (event.target.matches('#toggle-text')) {
                const snippetTextElement = document.getElementById('snippet-text');
                const toggleTextElement = event.target;
    
                if (toggleTextElement.textContent === "Show More") {
                    snippetTextElement.textContent = fullText; // Show full text
                    toggleTextElement.textContent = "Show Less";
                } else {
                    snippetTextElement.textContent = limitedText; // Revert to limited text
                    toggleTextElement.textContent = "Show More";
                }
            }
        });
    
        return overviewHTML;
    };
    
    
    
    // function createOverviewText(snippet) {
    //     const overviewTextHTML = `
    //     <div id="overview-text-container" class="body">
    //         <div id="overview-text" class="container">
    //             <span class="text text03">
    //                 ${snippet}
    //             </span>
    //         </div>
    //         <div id="button-more" class="button-more">
    //             <span id="text-close"class="text text03">
    //                 Show More
    //             </span>
    //         </div>
    //         `;
    //         const buttonMore = document.getElementById("button-more");

    //         document.addEventListener('click', (event) => {
    //             // if #overview-text matches button-more, class morecontent style display = none, html text = 'Show More'.
    //             // else if #overview-text #button-less, class morecontent style display = BLOCKS, html text = 'Show Less'
    //             if (event.target.matches('.modal-close') || event.target.matches('#button-more')) {
    //               document.getElementById('overview-text').style.display = 'none';
    //             } else if (event.target.matches('#button-more')) {
    //               document.getElementById('overview-text').style.display = 'block';
    //             }
    //           });
            
    //     // const buttonMore = document.createElement('span');
    //     //     buttonMore.classList.add('text', 'text03', 'button-more');
    //     //     buttonMore.textContent = 'Show More';
      
       
    //     // container.appendChild(text);
    //     // container.appendChild(buttonMore);
      
    //     // // Logic to toggle showing more or less
    //     // buttonMore.addEventListener('click', function() {
    //     //   // This logic should toggle the class or directly manipulate styles
    //     //   // to show all lines of the text and change the button text accordingly
    //     // });

    //     return overviewTextHTML;
    //   }

    const overviewText = createOverviewText(store.snippetOverview, limit);
    /////////////////////////////////////////////////////////
    //////////////////////// SNIPPET ////////////////////////
    /////////////////////////////////////////////////////////



    
    
    
    
    
    // If this script needs to be used in a context where its functionality is required elsewhere,
    // consider attaching necessary functions or objects to the `window` object for global accessibility.
  





    
    return `
        <section class="section store-overview overview">

            <div class="overview">

                <div class="title">
                    <span class="text03 bold">
                        ${title}
                    </span>
                </div>

                ${overviewText}

                <!--
                <div class="body">
                    <div class="container">
                        <span class="text text03">
                            $ {overviewText}
                            $ {snippet}
                        </span>
                    </div>
                    <div class="button-more">
                        <span class="text text03">
                            Show More
                        </span>
                    </div>
                </div>
                -->
            </div>



            ${element.lineH.render(30)}


            <div class="attributes">
                <div class="card">
                    <div class="snippet">
                        <div class="primary">
                            <div class="header">
                                <span class="text03 bold">
                                    Title
                                </span>
                                <button class="tag">
                                    <span class="text03 bold">
                                        <span class="percent">
                                            93%
                                        </span>
                                        <span class="percent">
                                            Recommended
                                        </span> 
                                    </span>
                                </button>
                            </div>
                            <div class="array">
                                ${attributesArray}
                            </div>
                        </div>
                        <div class="array">
                                <div class="pictogram">
                                    <i class="pictogram-facility-indoor-30"></i>
                                </div>
                                <div class="pictogram">
                                    <i class="pictogram-facility-outdoor-30"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="snippet">
                            <div class="primary">
                                <div class="header">
                                    <div class="text">
                                        <span class="title text03 bold">Title</span>
                                    </div>
                                    <button class="tag">
                                        <div class="text">
                                            <span class="text03">93% Recommended</span>
                                        </div>
                                    </button>
                                </div>
                                <div class="array">
                                    ${attributesFacilityHTML} 
                                </div>
                            </div>
                            <div class="array">
                            
                                <div class="pictogram">
                                    <i class="pictogram-table-indoor-30"></i>
                                </div>
                                <div class="pictogram">
                                    <i class="pictograph-table-outdoor-30"></i>
                                </div>
                                <div class="pictogram">
                                    <i class="pictogram-amenities-wifi-30"></i>
                                </div>
                                <div class="pictogram">
                                    <i class="pictogram-amenities-outlet-30"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${element.lineH.render(30)}

                
                <div class="summary">
                    <div class="list">
                        <div class="title">
                            <div class="text">
                                <span class="text03 bold">Title</span>
                            </div>
                        </div>
                        <div class="bullets">
                            ${attributesOverviewHTML}   
                        </div>
                    </div>



                    <div class="button">
                        <div class="button-anchor">

                            <button id="myBtn33" class="container">
                                <div class="label-glyph">
                                    <div class="text3">
                                        <div class="button2">button</div>
                                    </div>
                                    <div class="glyph">
                                        <div class="glyph-temp2"></div>
                                    </div>
                                </div>
                            </button>

                        </div>
                    </div>





                    <!-- The Modal -->
                    ${modalSection}
                    <!--
                    <h2>Bottom Sheet</h2>

                    <button id="myBtn" data-target="myModal">Open Modal</button>
                    <button id="myBtn" data-target="myModal1">Open Modal 1</button>

                    <div id="myModal" class="modal">
                        <div class="modal-content">
                            <div class="container">
                            <div class="modal-header">
                                <span id="myModal-close" class="modal-close">&times;</span>
                                <h2>Modal Header</h2>
                            </div>
                            <div class="modal">
                                <p>Some text in the Modal Body</p>
                                <p> Where can I get some?
                                There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is theref.
                                Where can I get some?
                                There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is theref.</p>
                                </p>
                            </div>
                            <div class="modal-footer">
                                <h3>Modal Footer</h3>
                            </div>
                            </div>
                        </div>
                    </div>

                    <div id="myModal1" class="modal">
                    <div class="modal-content">
                        <div class="container">
                        <div class="modal-header">
                            <span id="myModal1-close" class="modal-close">&times;</span>
                            <h2>Modal Header 1</h2>
                        </div>
                        <div class="modal-body">
                            <p>Some text in the Modal Body</p>
                            <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.

                            Why do we use it?
                            It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).

                            Where does it come from?
                            Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.

                            The standard chunk of Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections 1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also reproduced in their exact original form, accompanied by English versions from the 1914 translation by H. Rackham.

                            Where can I get some?
                            There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is theref.

                            Where can I get some?
                            There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is theref.
                            Where can I get some?
                            There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is theref.</p>
                        </div>
                        <div class="modal-footer">
                            <h3>Modal Footer</h3>
                        </div>
                        </div>
                    </div>
                    </div>
                    -->
                    <!-- The Modal End -->




                </div>
                ${element.lineH.render(30)}

        </section>
    `;
  },
};









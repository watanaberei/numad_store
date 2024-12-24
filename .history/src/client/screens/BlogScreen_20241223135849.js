// src/screens/BlogScreen.js
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { parseRequestUrl } from "../utils.js";
import { getStoresNeumadsReview, getArticleNeumadsTrail, getArticlePost, getStore } from "../api.js";
import DataBlog from "../components/DataPost";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import { format, parseISO } from "date-fns";
// import Grid from '../components/grid.js';


const renderOptions = {
  renderNode: {
    [BLOCKS.EMBEDDED_ENTRY]: (node, children) => {
      // Adjust the code as per your actual data structure and needs
    },
    [INLINES.HYPERLINK]: (node, next) => {
      // Adjust the code as per your actual data structure and needs
    },
    [BLOCKS.EMBEDDED_ASSET]: (node, children) => {
      // Adjust the code as per your actual data structure and needs
    },
  },
};

let dataBlog = new DataBlog();

const BlogScreen = {
  render: async () => {
  // const grid = new Grid('platinum');
  // grid.addRowToMain('c1-c2');
  // grid.addRowToMain('c2-c4');
  // grid.addRowToMain('c6');
  // grid.addRowToMain('c1');
  // grid.addRowToMain('c5col2');


    const request = parseRequestUrl();
    const blogDetails = await dataBlog.getData();

    // Filter the blogs based on the slug from the URL
    const blog = blogDetails.find((blog) => blog.slug === request.slug);
    console.log("blog",blog);
    const tags = blog.tag && blog.tag.length ? blog.tag[0].tags : [];
    console.log("Header tags",tags);


   
    console.log("tag",tags);
    const limitedTags03 = tags.slice(0, 3);
    console.log("limitedTags03",limitedTags03);
    let tagsHTML = '';
    limitedTags03.forEach(tags => {
      tagsHTML += `<div class="metadata-tag">
                     <span class="metadata-tag-text text01">${tags}</span>
                   </div>`;
    });
    // const tagsHTML = allTags(limitedTags03);
    // console.log("tagsHTML",tagsHTML);
    // if (!blog) {
    //   return `<div>Blog not found</div>`;
    // }
    if (!blog) {
      console.log(`No blog found with slug: ${request.slug}`);
    } else {
      console.log(`Blog found:`, blog);
      console.log(`Slug:`, blog.slug);
    }

    // return `
    //   <!--BLOGSCREEN-->
    //   <div class="main">
    //   BLOGEEEEEEs

          
    //     <!-- /// BLOG CONTENT /// -->
    //       <div class="blog-detail">
    //         <div class="blog-container">


            
    //           <section class="blog-hero">
              
    //             <div class="top fullBleedContent">
    //               <div class="fullBleedContentHeader">
    //                 <div class="fullBleedContentHeaderContainer">
    //                   <div class="featured-image">
                      
    //                     <img src="${blog.media.hero}" alt="" />
                    
    //                   </div>                    
    //                 </div>
    //               </div>
    //             </div>
                
    //             <div class="blog-headline">
    //               <div class="blog-header">
    //                 <div class="blog-header">

    //                   <div class="blog-title">
    //                     <span class="text02">
    //                       ${blog.series.series}
    //                     </span>
    //                     <span class="header06">
    //                       ${blog.headline.text}
    //                     </span>
    //                   </div>

    //                   <div class="blog-subtext">
    //                     <span class="text03">
    //                       ${blog.snippet.text}
    //                     </span>
    //                   </div>

    //                   <div class="blog-data">
    //                     <div class="tag-collection">
    //                       <div class="featured-blog-data-container">
    //                           <a href="/dine">
    //                               <div class="section-tag" id="${blog.category.category}">
    //                                 <i class="section-tag-icon icon-${blog.category.category}"></i>
    //                                 <span class="section-tag-divider">
    //                                 <div class="lineV"></div>
    //                                 </span>
    //                                 <a href="/${blog.category.category}">
    //                                   <span class="section-tag-text medium00">
    //                                       ${blog.category.category}
    //                                   </span>
    //                                 </a>
    //                               </div>
    //                             </a>
    //                         </div>
    //                         <div class="nav-list-divider">
    //                             <div class="lineV">
    //                             </div>
    //                         </div>
              
    //                         <div class="blog-data">
                                
    //                             ${tagsHTML}
                                    
    //                         </div>   
    //                     </div>
    //                     <div class="data-time">
    //                         <span class="data-time-text text01">2m Read</span>
    //                     </div>
    //                 </div>

    //                 </div>
    //               </div>
    //             </div>
    //           </section>

         


    //             <section class="blog-introduction">
    //               <div class="blog-introduction-content">
    //                 <div class="blog-overview">
    //                   <span class="text05">
    //                     ${blog.snippet.subtext}
    //                   </span>
    //                 </div>
    //                 <div class="lineH"></div>
    //                 <div class="blog-data">
    //                   <div class="tag-collection">
                          
    //                     <div class="featured-blog-data-container">
    //                         <a href="/${blog.category}">
    //                             <div class="section-tag" id="${blog.category}">
    //                                 <i class="section-tag-icon icon-${blog.category}"></i>
    //                                 <span class="section-tag-divider">
    //                                 <div class="lineV"></div>
    //                                 </span>
    //                                 <span class="section-tag-text medium00">
    //                                     ${blog.category}
    //                                 </span>
    //                             </div>
    //                         </a>
    //                     </div>
                            
                    
    //                     <div class="nav-list-divider">
    //                         <div class="lineV">
    //                         </div>
    //                     </div>

                        
    //                     <div class="featured-blog-data-container">
    //                         <div class="metadata-tag">
    //                             <span class="metadata-tag-text text01">${blog.tag}</span>
    //                         </div>   
    //                     </div>    
    //                   </div>
    //                   <div class="data-time">
    //                       <span class="data-time-text text01">2m Read</span>
    //                   </div>
    //                 </div>
                    
    //                 <!-- //INTRODUCTION// -->
    //                 <div class="lineH"></div>
                    
    //                 <div class="content">
    //                   <div class="blog-content">
    //                     <span class="text04">
    //                       ${blog.content.introduction}
    //                     </span>
    //                   </div>
    //                 </div>
    //                 <!-- //INTRODUCTION// -->


    //                 <!-- //STORES// -->
    //                 <div class="lineH"></div>
                    
    //                 <div class="content">
    //                   <div class="blog-content">
    //                     <span class="text04">
    //                       ${blog.content.stores}
    //                     </span>
    //                   </div>
    //                 </div>
    //                 <!-- //STORES// -->


    //                 <!-- //SUMMARY// -->
    //                 <div class="blog-content">
                        
    //                     <span class="text03">
    //                       Summary:
    //                     </span>
    //                     <ul class="summary-container">  
                          
    //                       ${Array.isArray(blog.summary.text) ? blog.summary.text.map(text => `
    //                         <li class="summary-item">
    //                           <span class="text04">   
    //                             — ${text}
    //                           </span>
    //                         </li>
    //                       `).join('') : ''}
    //                     </ul>
    //                 </div>
    //                 <!-- //SUMMARY// -->
                    
    //               </div>
    //               <!-- /// HEADER MAIN /// -->


                

                    










    //               <!-- /// HEADER SIDEPANEL /// -->
    //               <div class="content blog-sidepanel">
    //                 <div class="blog-content">
    //                   <span class="header03">
    //                     Related Blogs
    //                   </span>

    //                   <!--TAGS-->
    //                   <div class="blog-info d-flex">
    //                     <a href="/${blog.author.slug}">
    //                       <div class="blog-author">
    //                         <span class="d-flex text01">
    //                             ${blog.author.name}
    //                           </span>
    //                         <span class="d-flex text01">
    //                             "${blog.author.social}"
    //                           </span>
    //                       </div>
    //                     </a>
    //                   </div>
    //                   <!--END OF TAGS-->
                      
    //                 </div>
    //               </div>
    //                 <!-- /// HEADER CONTENT /// -->
    //             </section>




    //             <!--ADVERTISEMENT-->
    //             <div class="content content-advertisement content-advertistment-details">
    //               <div class="ad-container container">
    //                 <div class="ad d-flex" id="ad-home">
    //                   <a href="/">
    //                     <img src="./images/ad_test.png" />
    //                   </a>
    //                 </div>
    //               </div>
    //             </div>
    //             <!--ADVERTISEMENT-->






              
    //             <!-- /// BLOG BODY /// -->
    //             <section class="blog-body">    

    //               <!-- /// BLOG CONTENT /// -->
    //               <div class="content">
    //                 <div class="blog-content">
    //                   <span class="text03">
    //                     ${blog.content.body}
    //                   </span>
    //                 </div>
    //                 <div class="blog-content">
    //                   <span class="text03">
    //                   ${blog.content.conclusion}
    //                   </span>
    //                 </div>
    //                 <div class="blog-content">
    //                   <span class="text03">
    //                   ${blog.content.postscript}
    //                   </span>
    //                 </div>
    //               </div>
    //               <!-- /// BLOG CONTENT /// -->








    //               <!-- /// BLOG SIDEPANEL /// -->
    //               <div class="content">
    //                 <div class="blog-content">
    //                   <span class="header03">
    //                     Related Blogs
    //                   </span>

    //                   <!-- /// RELATED REFERENCES /// -->
    //                   <div class="primary-featured-blog-references">
    //                     $   {referencesHTML}
    //                   </div>
                      
                      
    //                 </div>
    //               </div>
    //               <!-- /// BLOG CONTENT /// -->









    //                 </div>

    //           </section>
    //           <!-- /// BLOG BODY /// -->

              

    //           <!--
    //           <div class="side-ad">
    //             <div class="lineH"></div>
    //             <a href="#" class="vertical-ad">
    //               <img src="/images/side-ad.svg"/>
    //             </a>
    //           </div>
    //           -->

    //         </div>
    //       </div>
    //       `;
    //     },
    return `
    <div class="grid">
      <div class="o1"></div>
      <div class="g m">
        <div class="p1"></div>
        <div class="c1">
          <div class="col1">m-c1-col1</div>
          <div class="col2">m-c1-col2</div>
          <div class="col3">m-c1-col3</div>
        </div>
        <div class="c2">
          <div class="col1">m-c2-col1</div>
          <div class="col2">m-c2-col2</div>
          <div class="col3">m-c2-col3</div>
        </div>
        <div class="c3">
          <div class="col1">m-c3-col1</div>
          <div class="col2">m-c3-col2</div>
          <div class="col3">m-c3-col3</div>
        </div>
        <div class="c4">
          <div class="col1">m-c4-col1</div>
          <div class="col2">m-c4-col2</div>
          <div class="col3">m-c4-col3</div>
        </div>
        <div class="c5">
          <div class="col1">m-c5-col1</div>
          <div class="col1">m-c5-col2</div>
          <div class="col1">m-c5-col3</div>
        </div>
        <div class="c6">
          <div class="col1">m-c6-col1</div>
          <div class="col1">m-c6-col2</div>
          <div class="col1">m-c6-col3</div>
        </div>
        <div class="p2"></div>
      </div>

      <div class="s">
        <div class="p3"></div>
        <div class="c1">
          <div class="col1">s-c1-col1</div>
          <div class="col2">s-c1-col2</div>
          <div class="col3">s-c1-col3</div>
        </div>
        <div class="c2">
          <div class="col1">s-c2-col1</div>
          <div class="col2">s-c2-col2</div>
          <div class="col3">s-c2-col3</div>
        </div>
        <div class="p4"></div>
      </div>
      <div class="o2"></div>
    </div>
    `;
},

//     return `
// <div class="grid platinum">
// <!-- platinum refers to the grid theme type, where they may be more than one grid type configured -->

// <div class="m">
//   <!-- SCHEMA -->
//   <div class="r">
//     <div class="c1-c2">
//       when there is a dash (-), it means from begining position, to, ending
//       position
//     </div>
//     <div class="c2-c4">
//       any overlaps in columns is treated like a row in a row
//     </div>
//     <div class="c6">
//       specifiying a cluster means to cover all of the specified cluster
//     </div>
//     <div class="c1">cover next column 1</div>
//     <div class="-c5col2">
//       adding a dash before any column, cluster,grid, main, or secondary acts
//       as something similar to flex where it covers the span of the next
//       specified value.
//     </div>
//   </div>

//   <!-- RULES -->
//   <div class="r c1-c6">
//     Every c element come with columns that have the same name: col1, col2,
//     col3.
//   </div>
//   <div class="r c1-c6">
//     Every c element come with columns that have the same name: col1, col2,
//     col3.
//   </div>
//   <div class="r c1col2-c6col2">
//     Every c element come with columns that have the same name: col1, col2,
//     col3. To specify which column, you lead with the c#, followed by the col#.
//   </div>
//   <div class="r c1-c6">
//     No r (row) class results to its default state where the div stays in the
//     row if there is enough space but will wrap to next row if there is no
//     space
//   </div>

//   <!-- EXCEPTION USECASE -->
//   <div class="r max">
//     max would cover all columns (col) of where the class is nested inincluding
//     the padding (p) and outer (o).
//   </div>
//   <div class="r full">
//     full would cover all columns (col) of where the class is nested in.
//   </div>
//   <div class="r half">
//     half would cover half of columns (col) of where the class is nested in.
//   </div>

//   <!-- EXAMPLE: ALL IN ONE ROW -->
//   <div class="r">
//     <div class="o1">
//       any o (outer) element is off limits unless specified like this or during
//       a exception usecase
//     </div>
//     <div class="p1">
//       any p is not encourage to use but is allowed when specified or during a
//       exception usecase
//     </div>

//     <div class="c1">covers all c1</div>
//     <div class="c2">covers all c2</div>
//     <div class="c3">covers all c3</div>
//     <div class="c4">covers all c4</div>
//     <div class="c5">covers all c5</div>
//     <div class="c6">covers all c6</div>
//     <div class="p2">
//       any p is not encourage to use but is allowed when specified or during a
//       exception usecase
//     </div>
//   </div>

// </div>




// <div class="s">
//   <!-- ERROR CASE -->
//   <div>
//     When there are no specified class, it defaults to a new row that start with the first available column, to, the last available column within the parent element.
//   </div> 
// </div>  
// </div>
// `;
// },

        after_render: () => {
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: "smooth",
          });
        },
      };
export default BlogScreen;

// src/services/api.js


// // API for blog
// import { createClient } from "contentful";
// // import dotenv from 'dotenv';

// // dotenv.config();

// const client = createClient({
//   space: process.env.CONTENTFUL_BLOG_ARTICLE_ID_20231903,
//   accessToken: process.env.CONTENTFUL_BLOG_ARTICLE_TOKEN_20231903,
// });

// export default client;
// // export default client; // Add this line to export the client object

// Change the import statement for contentful
// src/client/api.js
import { createClient } from 'contentful';
import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { documentToPlainTextString } from "@contentful/rich-text-plain-text-renderer";
import { resolveApiPath } from './utils/paths.js';
import { handleError } from './utils/errors.js';


// // Rest of your imports
// import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
// import { documentToPlainTextString } from "@contentful/rich-text-plain-text-renderer";





const client = createClient({
  space: "i1hcb4885ci0",
  accessToken: "Bcy-B6Lvepv3RLYinX-rY9x4KDpxJcv8_IH0PgF6odw",
});
const API_URL = 'http://localhost:4000';

// title,
// headline: { text: headline },
// slug,
// location: { address, geolocation: { lat, lng }, type },
// category,
// seriesName,
// media: {
//   thumbnail
// },
// snippet: { text: snippet },
// tag,
export async function getStore(limit = 1, collectionLimit = 6, skip = 0) {
  try {
    const query = `
    query {
      storesCollection(limit: ${limit}, skip: ${skip}) {
        items {
          sys {
            id
          }
          title
          headline {
            ... on Headline {
              text
              subtext
              eyebrow
            }
          }
          slug
          attributes {
            experiences
            services
            facility
            location
          }
          storeAttributes
          category {
            categoryType
            genre
          }
          location {
            ... on ContentTypeLocation {
              type
              geolocation {
                lat
                lon
              }
              address
              region
              locatedIn
              
            }
          }
          featured
          media {
            ... on Media {
              logo {
                url
              }
              hero {
                url
              }
              thumbnail {
                url
              }
              galleryCollection {
                items {
                  url
                }
              }
              serviceCollection {
                items {
                  url
                  description
                }
              }
              areaCollection {
                items {
                  url
                  description
                }
              }
              areaCollection {
                items {
                  url
                  description
                }
              }
            }
          }
          snippet {
            ... on Snippet {
              title
              text {
                json
              }
              overview
              foundations
              experience
              facility  
              service
              location
              hours
            }
          }
          storeNickname
          hours
          storeWebsite
          storeChain
          storeChainStoresCollection {
            ... on StoresStoreChainStoresCollection {
              items {
                handles
              }
            }
          }
          nearbyStoresCollection {
            ... on StoresNearbyStoresCollection {
              items {
                headline
                hours
                logo {
                  logo {
                    url
                  }
                }
                hours
                locationCollection(limit: 3, skip: 0) {
                  ... on SubstoresLocationCollection {
                    items {
                      type
                      geolocation {
                        lat
                        lon
                      }
                      address
                      region
                    }
                  }
                }
              }
            }
          } 
          neustar
          googleRatings
          yelpRatings
          storeRatings
          recommendation
          overviewTitle
          content {
            ... on Content {
              title
              overview {
                json
              }
            }
          }
          summary {
            ... on Summary {
              text
              facility
              overview
              details
              bestFor
              noiseLevel
              environment
              parking
              neustar
              experience
              foundation
              service
            }
          }
          popularTimes
          storeServices
          handles
          contact
          tagsCollection {
            items {
              tags
              metatag
              serviceTags
              attributeTags
              accessibilityTags
              offeringTags
              storeTags
              environmentTags
              reviewTags
              locationTags
            }
          }
        }
      }
    }
    
      `;
      

    const response = await fetch(
      "https://graphql.contentful.com/content/v1/spaces/i1hcb4885ci0?access_token=Bcy-B6Lvepv3RLYinX-rY9x4KDpxJcv8_IH0PgF6odw&locale=*",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      }
    );

    const json = await response.json();

    if (json.errors) {
      console.error("stores GraphQL errors:", json.errors);
    }

    if (!json.data) {
      return []; // Return an empty array if no data is found
    }

    const stores = json.data.storesCollection.items;
    // console.log("stores", stores);

    const data = stores.map((stores) => {
      return {
        ...stores,
        // title: stores?.title,
        // headline: stores?.headline,
        publishedAt: stores?.sys?.publishedAt,
        headline: {
          text: stores?.headline?.text,
          subtext: stores?.headline?.subtext,
          eyebrow: stores?.headline?.eyebrow,
        },
        storeNickname: stores?.storeNickName,
        slug: stores?.slug,
        attributes: stores?.attributes,
        featured: stores?.featured,
        category: {
          categoryType: stores?.category?.categoryType,
          genre: stores?.category?.genre,
        },
        series: {
          seriesName: stores?.series?.seriesName,
        },
        // sys: {
        //   id: stores?.sys?.id,
        // },
        location: {
          type: stores?.location?.type,
          geolocation: {
            lat: stores?.location?.geolocation?.lat,
            lon: stores?.location?.geolocation?.lon,
          },
          address: stores?.location?.address,
          region: stores?.location?.region,
          locatedIn: stores?.location?.locatedIn,
        },
        hours: stores?.hours,
        storeWebsite: stores?.storeWebsite,
        neustar: stores?.neustar,
        googleRatings: stores?.googleRatings,
        yelpRatings: stores?.yelpRatings,
        ratings: stores?.storeRatings,
        recommendation: stores?.recommendation,
        overviewTitle: stores?.overviewTitle,
        content: {
          overview: documentToHtmlString(stores?.content?.overview?.json),
        },
        // summary: {
        //   text: stores?.summary,
        // },
        popularTimes: stores?.popularTimes,
        storeServices: stores?.storeServices,
        handles: stores?.handles,
        contact: stores?.contact,
        // storeReviewSource: stores?.storeReviewSource,
        // area: stores?.area,
        storeAttribute: stores?.storeAttributes,
        snippet: {
          title: stores?.snippet?.title,
          text: documentToHtmlString(stores?.snippet?.text?.json),
          overview: stores?.snippet?.overview,
          foundations: stores?.snippet?.foundations,
          facility: stores?.snippet?.facility,
          experience: stores?.snippet?.experience,
          service: stores?.snippet?.service,
          location: stores?.snippet?.location,
          hours: stores?.snippet?.hours,
        },
        media: {
          logo: stores?.media?.logo?.url,
          hero: stores?.media?.hero?.url,
          thumbnail: stores?.media?.thumbnail?.url,
          gallery: stores?.media?.galleryCollection?.items.map((item) => ({
            url: item?.url,
            description: item?.description,
          })),
          service: stores?.media?.serviceCollection?.items.map(
            (item) => ({
              url: item?.url,
              description: item?.description,
            })
          ),
          area: stores?.media?.areaCollection?.items.map((item) => ({
            url: item?.url,
            description: item?.description,
          })),
          arrangement: stores?.media?.arrangementCollection?.items.map((item) => ({
            url: item?.url,
            description: item?.description,
          })),         
        },

        nearbyStore: stores?.nearbyStoresCollection?.items.map((item) => ({
              nearbyHeadline: item?.headline,
              nearbyHours: item?.hours,
              nearbyLogo: item?.logo?.logo?.url,
              nearbyLocation: {
                nearbyLocationType: item?.location?.type,
                nearbyLocationAddress: item?.location?.address,
                nearbyLocationGeolocation: {
                  nearbyLocationGeolocationLat: item?.location?.geolocation?.lat,
                  nearbyLocationGeolocationLon: item?.location?.geolocation?.lon,
                },
              nearbyLocationRegion: item?.location?.region,
            },
          }),
        ),

        
        summary: {
          text: stores?.summary?.text,
          facility: stores?.summary?.facility,
          details: stores?.summary?.details,
          overview: stores?.summary?.overview,
          best: stores?.summary?.bestFor,
          experience: stores?.summary?.experience,
          service: stores?.summary?.service,
          foundation: stores?.summary?.foundation,
          noise: stores?.summary?.noiseLevel,
          parking: stores?.summary?.parking,
          environment: stores?.summary?.environment,
        },
        overviewTitle: stores?.overviewTitle,
        overview: {
          type: stores?.content?.type,
          text: documentToHtmlString(stores?.content?.overview?.json),
        },
        // overviewContent: {
        //   title: stores?.snippet?.title,
        //   text: documentToHtmlString(stores?.snippet?.text?.json),
        // },
        // reference: {
        //   relatedReferences:
        //     stores?.reference?.relatedReferencesCollection?.items.map(
        //       (item) => ({
        //         title: item.title,
        //         headline: item.headline,
        //         section: item.section,
        //         // media: {
        //         //   thumbnail: item.media.thumbnail.url,
        //         // },
        //         overview: item.overview,
        //         slug: item.slug,
        //         tag: item.tag,
        //         relatedCategory: item.category,
        //       })
        //     ),
        //   suggestedReferences:
        //     stores?.reference?.suggestedReferencesCollection?.items.map(
        //       (item) => ({
        //         title: item.title,
        //         section: item.section,
        //         // media: {
        //         //   thumbnail: item.media.thumbnail.url,
        //         // },
        //         overview: item.overview,
        //         slug: item.slug,
        //         tag: item.tag,
        //       })
        //     ),
        //   similarReferences:
        //     stores?.reference?.similarReferencesCollection?.items.map(
        //       (item) => ({
        //         title: item.title,
        //         section: item.section,
        //         // media: {
        //         //   thumbnail: item.media.thumbnail.url,
        //         // },
        //         overview: item.overview,
        //         slug: item.slug,
        //         tag: item.tag,
        //       })
        //     ),
        // },
        tag: stores?.tagsCollection?.items.map((item) => ({
          tags: item?.tags,
          tagMetatag: item?.metatag,
          serviceTags: item?.serviceTags,
          attributeTags: item?.attributeTags,
          accessibilityTags: item?.accessibilityTags,
          offeringTags: item?.offeringTags,
          storeTags: item?.storeTags,
          environmentTags: item?.environmentTags,
          reviewTags: item?.reviewTags,
          locationTags: item?.locationTags,
        })),
      };
    });
    documentToPlainTextString(getStore);
    // console.log("Data for getStore data:", data);
    // console.log("Data for getStore:", getStore);
    return data;
  } catch (err) {
    console.error(err);
    // You can decide what to return in case of error, perhaps null or an empty array
    return null;
  }
}

export async function getArticleNeumadsTrail(limit = 6, skip = 0) {
  try {
    const query = `
    query {
      articleNeumadsTrailCollection(limit: ${limit}, skip: ${skip}) {
        items {
          sys {
            id
            publishedAt
          }
          title
          featured
          slug
          featured
          category {
            categoryType
            genre
          }
          series {
            seriesName
          }
          headline {
            ... on Headline {
              text
              subtext
              eyebrow
            }
          }
          location {
            ... on ContentTypeLocation {
              type
              geolocation {
                lat
                lon
              }
              address
              region
            }
          }
          author {
            ... on Author {  # Use the correct type for author entries
              social
              authorPseudonym
              slug
              media {
                ... on Media {
                	thumbnail {
                  	url
                	}
                  hero {
                  	url
                  }
                }
              }
              authorBio {
                ... on  ContentDefault{
              	 	title
                  introduction {
                    json
                  }
                  body {
                    json
                  }
                  conclusion {
                    json
                  }
                  postscript {
                    json
                  }
                }
            	}
              authorSnippet {
                ... on SnippetDefault {
                  title
									subtext 
                }
              }
            }
          }
          snippet {
            ... on Snippet {
              title
              text {
                json
              }
              overview
              facility
              service
              location
              hours
            }
          }
          summary {
            ... on Summary {
              text
              bestFor
              noiseLevel
              environment
              parking
            }
          }
          media {
            ... on Media {
              thumbnail {
                url
              }
              hero {
                url
              }
              galleryCollection {
                items {
                  url
                }
              }
            }
          }
          content {
            ... on Content {
              introduction {
                json
              }
              type
              stores {
                json
              }
              body {
                json
              }
              bodyCurrated 
              bodyTable
              conclusion {
                json
              }
            }
          }
          tagsCollection {
            items {
              tags
              metatag
              serviceTags
              attributeTags
              accessibilityTags
              offeringTags
              storeTags
              environmentTags
              reviewTags
              locationTags
            }
          }

          reference {
            ... on ReferenceDefault {
              relatedReferencesCollection(limit: 3) {
                items {
                  ... on AppFastFoodHomePage031523 {
                    title
                    category {
                      categoryType
                      genre
                    }
                    media {
                      ... on Media {
                        thumbnail {
                          url
                        }
                      }
                    }
                    slug
                    snippet {
                      ... on Snippet {
                        title
                        text {
                          json
                        }
                      }
                    }
                    tagsCollection {
                      items {
                        tags
                        metatag
                      }
                    }
                  }
                }
              }
              suggestedReferencesCollection(limit: 3) {
                items {
                  ... on AppFastFoodHomePage031523 {
                    title
                    category {
                      categoryType
                      genre
                    }
                    media {
                      ... on Media {
                        thumbnail {
                          url
                        }
                      }
                    }
                    slug
                    snippet {
                      ... on Snippet {
                        title
                        text {
                          json
                        }
                      }
                    }
                    tagsCollection {
                      items {
                        tags
                        metatag
                      }
                    }
                  }
                }
              }
              similarReferencesCollection(limit: 3) {
                items {
                  ... on AppFastFoodHomePage031523 {
                    title
                    category {
                      categoryType
                      genre
                    }
                    media {
                      ... on Media {
                        thumbnail {
                          url
                        }
                      }
                    }
                    slug
                    snippet {
                      ... on Snippet {
                        title
                        text {
                          json
                        }
                      }
                    }
                    tagsCollection {
                      items {
                        tags
                        metatag
                      }
                    }
                  }
                }
              }
            }
          }
        } 
      }
    }
    
      `;

    const response = await fetch(
      "https://graphql.contentful.com/content/v1/spaces/i1hcb4885ci0?access_token=Bcy-B6Lvepv3RLYinX-rY9x4KDpxJcv8_IH0PgF6odw&locale=*",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      }
    );

    const json = await response.json();

    if (json.errors) {
      console.error("articleNeumadsTrail GraphQL errors:", json.errors);
    }

    if (!json.data) {
      return []; // Return an empty array if no data is found
    }

    const articles = json.data.articleNeumadsTrailCollection.items;
    // console.log("articles", articles);

    const data = articles.map((articles) => {
      return {
        ...articles,
        title: articles?.title,

        publishedAt: articles?.sys?.publishedAt,


        // id: articles?.sys?.id,

        // headline: articles?.headline,
        location: {
          type: articles?.location?.type,
          geolocation: {
            lat: articles?.location?.geolocation?.lat,
            lon: articles?.location?.geolocation?.lon,
          },
          address: articles?.location?.address,
          region: articles?.location?.region,
        },

        slug: articles?.slug,
        featured: articles?.featured,
        headline: {
          text: articles?.headline?.text,
          slug: articles?.headline?.slug,
          subtext: articles?.headline?.subtext,
          eyebrow: articles?.headline?.eyebrow,
        },
        snippet: {
          title: articles?.snippet?.title,
          text: articles?.snippet?.text,
          overview: articles?.overview?.text,
          facility: articles?.facility?.text,
          service: articles?.service?.text,
          location: articles?.location?.text,
          hours: articles?.hours?.text,
        },
        categories: {
          categoryType: articles?.category?.categoryType,
          genre: articles?.category?.genre,
        },
        series: {
          seriesName: articles?.series?.seriesName,
        },
        author: {
          name: articles?.author?.authorPseudonym,
          media: {
            thumbnail: articles?.author?.media?.thumbnail?.url,
            hero: articles?.author?.media?.hero?.url,
          },
          slug: articles?.author?.slug,
          social: articles?.author?.social,
          bio: {
            title: articles?.author?.authorBio?.title,
            introduction: articles?.author?.authorBio?.introduction,
            body: articles?.author?.authorBio?.body,
            conclusion: articles?.author?.authorBio?.conclusion,
            postscript: articles?.author?.authorBio?.postscript,
          },
          snippet: {
            title: articles?.author?.authorSnippet?.title,
            text: articles?.author?.authorSnippet?.subtext,
          },
        },
        media: {
          hero: articles?.media?.hero?.url,
          thumbnail: articles?.media?.thumbnail?.url,
          gallery: articles?.media?.galleryCollection?.items.map((item) => ({
            url: item?.url,
          })),
        },
        // snippet: {
        //   title: articles?.snippet?.title,
        //   text: documentToHtmlString(articles?.snippet?.text?.json),
        // },
        summary: {
          text: articles?.summary?.text,
        },
        content: {
          introduction: documentToHtmlString(
            articles?.content?.introduction?.json
          ),
          type: articles?.content?.type,
          stores: documentToHtmlString(articles?.content?.stores?.json),
          body: documentToHtmlString(articles?.content?.body?.json),
          bodyCurrated: articles?.content?.bodyCurrated,
          bodyTable: articles?.content?.bodyTable,
          conclusion: documentToHtmlString(articles?.content?.conclusion?.json),
        },
        postscript: {
          text: documentToHtmlString(articles?.postscript?.text?.json),
        },
        // references: {
        //   relatedReferences:
        //     articles?.reference?.relatedReferencesCollection?.items.map(
        //       (item) => ({
        //         title: item.title,
        //         headline: item.headline,
        //         section: item.section,
        //         // media: {
        //         //   thumbnail: item.media.thumbnail.url,
        //         // },
        //         overview: item.overview,
        //         slug: item.slug,
        //         tag: item.tag,
        //         relatedCategory: item.category,
        //       })
        //     ),
        //   suggestedReferences:
        //     articles?.reference?.suggestedReferencesCollection?.items.map(
        //       (item) => ({
        //         title: item.title,
        //         section: item.section,
        //         // media: {
        //         //   thumbnail: item.media.thumbnail.url,
        //         // },
        //         overview: item.overview,
        //         slug: item.slug,
        //         tag: item.tag,
        //       })
        //     ),
        //   similarReferences:
        //     articles?.reference?.similarReferencesCollection?.items.map(
        //       (item) => ({
        //         title: item.title,
        //         section: item.section,
        //         // media: {
        //         //   thumbnail: item.media.thumbnail.url,
        //         // },
        //         overview: item.overview,
        //         slug: item.slug,
        //         tag: item.tag,
        //       })
        //     ),
        // },
        reference: {
          relatedReferences:
            articles?.reference?.relatedReferencesCollection?.items.map(
              (item) => ({
                title: item.title,
                // headline: item.headline,
                section: item.section,
                // media: {
                //   thumbnail: item.media.thumbnail.url,
                // },
                overview: item.overview,
                slug: item.slug,
                tag: item.tag,
                relatedCategory: item.categoryType,
              })
            ),
          suggestedReferences:
            articles?.reference?.suggestedReferencesCollection?.items.map(
              (item) => ({
                title: item.title,
                section: item.section,
                // media: {
                //   thumbnail: item.media.thumbnail.url,
                // },
                overview: item.overview,
                slug: item.slug,
                tag: item.tag,
              })
            ),
          similarReferences:
            articles?.reference?.similarReferencesCollection?.items.map(
              (item) => ({
                title: item.title,
                section: item.section,
                // media: {
                //   thumbnail: item.media.thumbnail.url,
                // },
                overview: item.overview,
                slug: item.slug,
                tag: item.tag,
              })
            ),
        },
        tag: articles?.tagsCollection?.items.map((item) => ({
          tags: item?.tags,
          tagMetatag: item?.metatag,
          serviceTags: item?.serviceTags,
          attributeTags: item?.attributeTags,
          accessibilityTags: item?.accessibilityTags,
          offeringTags: item?.offeringTags,
          storeTags: item?.storeTags,
          environmentTags: item?.environmentTags,
          reviewTags: item?.reviewTags,
          locationTags: item?.locationTags,
        })),
      };
    });
    documentToPlainTextString(getArticleNeumadsTrail);
    // console.log('Data for getStoresNeumadsReview data:', data);
    // console.log('Data for getStoresNeumadsReview:', getStoresNeumadsReview);
    return data;
  } catch (err) {
    console.error(err);
    // You can decide what to return in case of error, perhaps null or an empty array
    return null;
  }
}

export const getStoresNeumadsReview = async (limit = 9, skip = 0) => {
  try {
    const query = `
    query {
      storesNeumadsReviewCollection(limit: ${limit}, skip: ${skip}) {
        items {
          sys {
            id
          }
          title
          location {
            ... on ContentTypeLocation {
              type
              geolocation {
                lat
                lon
              }
              address
              region
            }
          }
          featured

          headline {
            ... on Headline {
              text
              subtext
              eyebrow
            }
          }
          slug
          featured
          category {
            categoryType
            genre
          }
          series {
            seriesName
          }
          author {
            ... on Author {  # Use the correct type for author entries
              social
              authorPseudonym
              slug
              media {
                ... on Media {
                	thumbnail {
                  	url
                	}
                  hero {
                  	url
                  }
                }
              }
              authorBio {
                ... on  ContentDefault{
              	 	title
                  introduction {
                    json
                  }
                  body {
                    json
                  }
                  conclusion {
                    json
                  }
                  postscript {
                    json
                  }
                }
            	}
              authorSnippet {
                ... on SnippetDefault {
                  title
									subtext 
                }
              }
            }
          }
          media {
            ... on Media {
              title
              logo {
                url
              }
              hero {
                url
              }
              thumbnail {
                url
              }
              galleryCollection {
                items {
                  url
                }
              }
            }
          }
          snippet {
            ... on Snippet {
              title
              text {
                json
              }
            }
          }
          summary {
            ... on Summary {
              text
              bestFor
              noiseLevel
              environment
              parking
            }
          }
          content {
            ... on Content {
              introduction {
                json
              }
              type
              stores{
                json
              }
              body {
                json
              }
              bodyCurrated 
              bodyTable
              conclusion {
                json
              }
            }
          }
          attributes {
            amenities
            offers
          }
          postscript {
            ... on Postscript {
              text {
                json
              }
            }
          }
          reference {
            ... on ReferenceDefault {
              relatedReferencesCollection(limit: 3) {
                items {
                  ... on AppFastFoodHomePage031523 {
                    title
                    category {
                      categoryType
                      genre
                    }
                    media {
                      ... on Media {
                        thumbnail {
                          url
                        }
                      }
                    }
                    slug
                    snippet {
                      ... on Snippet {
                        title
                        text {
                          json
                        }
                      }
                    }
                    tagsCollection {
                      items {
                        tags
                        metatag
                      }
                    }
                  }
                }
              }
              suggestedReferencesCollection(limit: 3) {
                items {
                  ... on AppFastFoodHomePage031523 {
                    title
                    category {
                      categoryType
                      genre
                    }
                    media {
                      ... on Media {
                        thumbnail {
                          url
                        }
                      }
                    }
                    slug
                    snippet {
                      ... on Snippet {
                        title
                        text {
                          json
                        }
                      }
                    }
                    tagsCollection {
                      items {
                        tags
                        metatag
                      }
                    }
                  }
                }
              }
              similarReferencesCollection(limit: 3) {
                items {
                  ... on AppFastFoodHomePage031523 {
                    title
                    category {
                      categoryType
                      genre
                    }
                    media {
                      ... on Media {
                        thumbnail {
                          url
                        }
                      }
                    }
                    slug
                    snippet {
                      ... on Snippet {
                        title
                        text {
                          json
                        }
                      }
                    }
                    tagsCollection {
                      items {
                        tags
                        metatag
                      }
                    }
                  }
                }
              }
            }
          }
        } 
      }
    }
    
    
      `;
    const response = await fetch(
      "https://graphql.contentful.com/content/v1/spaces/i1hcb4885ci0?access_token=Bcy-B6Lvepv3RLYinX-rY9x4KDpxJcv8_IH0PgF6odw&locale=*",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      }
    );

    const json = await response.json();

    if (json.errors) {
      console.error("articleNeumadsTrail GraphQL errors:", json.errors);
    }

    if (!json.data) {
      return []; // Return an empty array if no data is found
    }

    const reviews = json.data.storesNeumadsReviewCollection.items;
    // console.log("store", reviews);

    const data = reviews.map((reviews) => {
      return {
        ...reviews,
        title: reviews?.title,
        publishedAt: reviews?.sys?.publishedAt,

        // id: reviews?.sys?.id,

        location: {
          type: reviews?.location?.type,
          geolocation: {
            lat: reviews?.location?.geolocation?.lat,
            lon: reviews?.location?.geolocation?.lon,
          },
          address: reviews?.location?.address,
          region: reviews?.location?.region,
        },
        slug: reviews?.slug,
        featured: reviews?.featured,
        
        headline: {
          text: reviews?.headline?.text,
          slug: reviews?.headline?.slug,
          subtext: reviews?.headline?.subtext,
          eyebrow: reviews?.headline?.eyebrow,
        },
        categories: {
          categoryType: reviews?.category?.categoryType,
          genre: reviews?.category?.genre,
        },
        series: {
          seriesName: reviews?.series?.seriesName,
        },
        author: {
          name: reviews?.author?.authorPseudonym,
          media: {
            thumbnail: reviews?.author?.media?.thumbnail?.url,
            hero: reviews?.author?.media?.hero?.url,
          },
          slug: reviews?.author?.slug,
          social: reviews?.author?.social,
          authorBio: {
            title: reviews?.author?.authorBio?.title,
            introduction: reviews?.author?.authorBio?.introduction,
            body: reviews?.stores?.authorBio?.body,
            conclusion: reviews?.author?.authorBio?.conclusion,
            postscript: reviews?.author?.authorBio?.postscript,
          },
          authorSnippet: {
            title: reviews?.author?.authorSnippet?.title,
            text: reviews?.author?.authorSnippet?.subtext,
          },
        },
        media: {
          logo: reviews?.media?.logo?.url,
          hero: reviews?.media?.hero?.url,
          thumbnail: reviews?.media?.thumbnail?.url,
          gallery: reviews?.media?.galleryCollection?.items.map((item) => ({
            url: item?.url,
          })),
        },
        // snippet: {
        //   title: reviews?.snippet?.title,
        //   text: documentToHtmlString(reviews?.snippet?.text?.json),
        // },
        snippet: {
          title: reviews?.snippet?.title,
          text: reviews?.snippet?.text,
        },
        summary: {
          text: reviews?.summary?.text,
        },
        content: {
          introduction: documentToHtmlString(
            reviews?.content?.introduction?.json
          ),
          stores: documentToHtmlString(reviews?.content?.stores?.json),
          body: documentToHtmlString(reviews?.content?.body?.json),
          bodyCurrated: documentToHtmlString(
            reviews?.content?.bodyCurrated?.json
          ),
          bodyTable: documentToHtmlString(reviews?.content?.bodyTable?.json),
          conclusion: documentToHtmlString(reviews?.content?.conclusion?.json),
        },
        attributes: {
          amentities: reviews?.attributes?.amentities,
          offers: reviews?.attributes?.offers,
        },
        postscript: {
          text: documentToHtmlString(reviews?.postscript?.text?.json),
        },
        reference: {
          relatedReferences:
            reviews?.reference?.relatedReferencesCollection?.items.map(
              (item) => ({
                title: item.title,
                headline: item.headline,
                section: item.section,
                // media: {
                //   thumbnail: item.media.thumbnail.url,
                // },
                overview: item.overview,
                slug: item.slug,
                tag: item.tag,
                relatedCategory: item.categoryType,
              })
            ),
          suggestedReferences:
            reviews?.reference?.suggestedReferencesCollection?.items.map(
              (item) => ({
                title: item.title,
                section: item.section,
                // media: {
                //   thumbnail: item.media.thumbnail.url,
                // },
                overview: item.overview,
                slug: item.slug,
                tag: item.tag,
              })
            ),
          similarReferences:
            reviews?.reference?.similarReferencesCollection?.items.map(
              (item) => ({
                title: item.title,
                section: item.section,
                // media: {
                //   thumbnail: item.media.thumbnail.url,
                // },
                overview: item.overview,
                slug: item.slug,
                tag: item.tag,
              })
            ),
        },
        tag: reviews?.tagsCollection?.items.map((item) => ({
          tags: item?.tags,
          tagMetatag: item?.metatag,
          serviceTags: item?.serviceTags,
          attributeTags: item?.attributeTags,
          accessibilityTags: item?.accessibilityTags,
          offeringTags: item?.offeringTags,
          storeTags: item?.storeTags,
          environmentTags: item?.environmentTags,
          reviewTags: item?.reviewTags,
          locationTags: item?.locationTags,
        })),
      };
    });
    documentToPlainTextString(getStoresNeumadsReview);
    // console.log('Data for getStoresNeumadsReview data:', data);
    // console.log('Data for getStoresNeumadsReview:', getStoresNeumadsReview);
    return data;
  } catch (err) {
    console.error(err);
    // You can decide what to return in case of error, perhaps null or an empty array
    return null;
  }
};

// export const getStoresNeumadsReview = async (limit = 9, skip = 0) => {
//   try {
//     const query = `
//     query {
//       storesNeumadsReviewCollection(limit: ${limit}, skip: ${skip}) {
//         items {
//           sys {
//             id
//           }
//           title
//           location {
//             ... on ContentTypeLocation {
//               type
//               geolocation {
//                 lat
//                 lng
//               }
//               address
//               region
//             }
//           }
//           featured
//           store{
//             ... on Stores {
//               storeName
//               storeNickname
//               hours
//               storeWebsite
//               storeChain
//               storeChainStoresCollection{
//                 items{
//                   storeName
//                   storeNickname
//                   hours
//                   storeWebsite
//                 }
//               }
//               neustar
//               storeRating
//               storeRatingsCount
//               storeReviewOverview
//               handles
//               contact
//               storeReviewSource
//               storeBio {
//                 title
//                 introduction {
//                   json
//                 }
//                 body {
//                   json
//                 }
//                 conclusion {
//                   json
//                 }
//                 postscript {
//                   json
//                 }
//               }
//               storeTagsCollection {
//                 items {
//                   tags
//                   metatag
//                 }
//               }
//             }
//           }
//           headline {
//             text
//             eyebrow
//           }
//           slug
//           featured
//           category {
//             category
//           }
//           series {
//             seriesName
//           }
//           author {
//             ... on Author {  # Use the correct type for author entries
//               social
//               authorPseudonym
//               slug
//               media {
//                 ... on Media {
//                 	thumbnail {
//                   	url
//                 	}
//                   hero {
//                   	url
//                   }
//                 }
//               }
//               authorBio {
//                 ... on  ContentDefault{
//               	 	title
//                   introduction {
//                     json
//                   }
//                   body {
//                     json
//                   }
//                   conclusion {
//                     json
//                   }
//                   postscript {
//                     json
//                   }
//                 }
//             	}
//               authorSnippet {
//                 ... on SnippetDefault {
//                   title
// 									subtext
//                 }
//               }
//             }
//           }
//           media {
//             ... on Media {
//               title
//               hero {
//                 url
//               }
//               thumbnail {
//                 url
//               }
//               galleryCollection {
//                 items {
//                   url
//                 }
//               }
//             }
//           }
//           snippet {
//             ... on Snippet {
//               title
//               text {
//                 json
//               }
//             }
//           }
//           summary {
//             ... on Summary {
//               text
//             }
//           }
//           content {
//             ... on Content {
//               introduction {
//                 json
//               }
//               type
//               stores{
//                 json
//               }
//               body {
//                 json
//               }
//               bodyCurrated
//               bodyTable
//               conclusion {
//                 json
//               }
//             }
//           }
//           attributes {
//             amenities
//             offers
//           }
//           postscript {
//             ... on Postscript {
//               text {
//                 json
//               }
//             }
//           }
//           reference {
//             ... on ReferenceDefault {
//               relatedReferencesCollection(limit: 6) {
//                 items {
//                   ... on AppFastFoodHomePage031523 {
//                     title
//                     slug
//                   }
//                 }
//               }
//               suggestedReferencesCollection(limit: 6) {
//                 items {
//                   ... on AppFastFoodHomePage031523 {
//                     title
//                     slug
//                   }
//                 }
//               }
//               similarReferencesCollection(limit: 6) {
//                 items {
//                   ... on AppFastFoodHomePage031523 {
//                     title
//                     slug
//                   }
//                 }
//               }
//             }
//           }
//           tagsCollection {
//             items {
//               tags
//               metatag
//             }
//           }
//         }
//       }
//     }

//       `;
//     const response = await fetch(
//       "https://graphql.contentful.com/content/v1/spaces/i1hcb4885ci0?access_token=Bcy-B6Lvepv3RLYinX-rY9x4KDpxJcv8_IH0PgF6odw&locale=*",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ query }),
//       }
//     );

//     const json = await response.json();

//     if (json.errors) {
//       console.error("articleNeumadsTrail GraphQL errors:", json.errors);
//     }

//     if (!json.data) {
//       return []; // Return an empty array if no data is found
//     }

//     const stores = json.data.storesNeumadsReviewCollection.items;
// // console.log("store", stores);

//     const data = stores.map((stores) => {
//       return {
//         ...stores,
//         title: stores?.title,
//         location: {
//           type: stores?.location?.type,
//           geolocation: {
//             lat: stores?.location?.geolocation?.lat,
//             lng: stores?.location?.geolocation?.long,
//           },
//           address: stores?.location?.address,
//           region: stores?.location?.region,
//         },
//         slug: stores?.slug,
//         featured: stores?.featured,
//         store: {
//           storeName: stores?.store?.storeName,
//           storeNickname: stores?.store?.storeNickname,
//           hours: stores?.store?.hours,
//           storeWebsite: stores?.store?.storeWebsite,
//           storeChain: stores?.store?.storeChain,
//           storeChainStoresCollection:
//             stores?.store?.storeChainStoresCollection?.items.map((item) => ({
//               storeName: item?.storeName,
//               storeNickname: item?.storeNickname,
//               hours: item?.hours,
//               storeWebsite: item?.storeWebsite,
//               storeGeolocation: {
//                 lat: item?.storeGeolocation?.lat,
//                 lng: item?.storeGeolocation?.lng,
//               },
//               storeAddress: item?.storeAddress,
//               storeChain: item?.storeChain,
//               storeChainStoresCollection:
//                 item?.storeChainStoresCollection?.items.map((item) => ({
//                   storeName: item?.storeName,
//                   storeNickname: item?.storeNickname,
//                   hours: item?.hours,
//                   storeWebsite: item?.storeWebsite,
//                 })),
//               neustar: item?.neustar,
//               storeRating: item?.storeRating,
//               storeRatingsCount: item?.storeRatingsCount,
//               storeReviewOverview: item?.storeReviewOverview,
//               handles: item?.handles,
//               contact: item?.contact,
//               storeReviewSource: item?.storeReviewSource,
//               storeBio: {
//                 title: item?.storeBio?.title,
//                 introduction: item?.storeBio?.introduction?.json,
//                 body: item?.storeBio?.body?.json,
//                 conclusion: item?.storeBio?.conclusion?.json,
//                 postscript: item?.storeBio?.postscript?.json,
//               },
//               storeTagsCollection: item?.storeTagsCollection?.items.map(
//                 (item) => ({
//                   tags: item?.tags,
//                   metatag: item?.metatag,
//                 })
//               ),
//             })),
//         },
//         headline: {
//           text: stores?.headline?.text,
//           slug: stores?.headline?.slug,
//         },
//         categories: {
//           category: stores?.category?.category,
//         },
//         series: {
//           seriesName: stores?.series?.seriesName,
//         },
//         author: {
//           name: stores?.author?.authorPseudonym,
//           media: {
//             thumbnail : stores?.author?.media?.thumbnail?.url,
//             hero : stores?.author?.media?.hero?.url,
//           },
//           slug: stores?.author?.slug,
//           social: stores?.author?.social,
//           authorBio: {
//             title: stores?.author?.authorBio?.title,
//             introduction: stores?.author?.authorBio?.introduction,
//             body: stores?.stores?.authorBio?.body,
//             conclusion: stores?.author?.authorBio?.conclusion,
//             postscript: stores?.author?.authorBio?.postscript,
//           },
//           authorSnippet: {
//             title: stores?.author?.authorSnippet?.title,
//             text: stores?.author?.authorSnippet?.subtext,
//           },
//         },
//         media: {
//           hero: stores?.media?.hero?.url,
//           thumbnail: stores?.media?.thumbnail?.url,
//           gallery: stores?.media?.galleryCollection?.items.map((item) => ({
//             url: item?.url,
//           })),
//         },
//         snippet: {
//           title: stores?.snippet?.title,
//           text: documentToHtmlString(stores?.snippet?.text?.json),
//         },
//         summary: {
//           text: stores?.summary?.text,
//         },
//         content: {
//           introduction: documentToHtmlString(stores?.content?.introduction?.json),
//           stores: documentToHtmlString(stores?.content?.stores?.json),
//           body: documentToHtmlString(stores?.content?.body?.json),
//           bodyCurrated: documentToHtmlString(stores?.content?.bodyCurrated?.json),
//           bodyTable: documentToHtmlString(stores?.content?.bodyTable?.json),
//           conclusion: documentToHtmlString(stores?.content?.conclusion?.json),
//         },
//         attributes: {
//           amentities: stores?.attributes?.amentities,
//           offers: stores?.attributes?.offers,
//         },
//         postscript: {
//           text: documentToHtmlString(stores?.postscript?.text?.json),
//         },
//         reference: {
//           relatedReferences:
//             stores?.reference?.relatedReferencesCollection?.items.map(
//               (item) => ({
//                 title: item.title,
//                 headline: item.headline,
//                 section: item.section,
//                 // media: {
//                 //   thumbnail: item.media.thumbnail.url,
//                 // },
//                 overview: item.overview,
//                 slug: item.slug,
//                 tag: item.tag,
//                 relatedCategory: item.category,
//               })
//             ),
//           suggestedReferences:
//             stores?.reference?.suggestedReferencesCollection?.items.map(
//               (item) => ({
//                 title: item.title,
//                 section: item.section,
//                 // media: {
//                 //   thumbnail: item.media.thumbnail.url,
//                 // },
//                 overview: item.overview,
//                 slug: item.slug,
//                 tag: item.tag,
//               })
//             ),
//           similarReferences:
//             stores?.reference?.similarReferencesCollection?.items.map(
//               (item) => ({
//                 title: item.title,
//                 section: item.section,
//                 // media: {
//                 //   thumbnail: item.media.thumbnail.url,
//                 // },
//                 overview: item.overview,
//                 slug: item.slug,
//                 tag: item.tag,
//               })
//             ),
//         },
//         tag: stores?.tagsCollection?.items.map((item) => ({
//           tags: item?.tags,
//           metatag: item?.metatag,
//         })),
//       };
//     });
//     documentToPlainTextString(getStoresNeumadsReview);
//     // console.log('Data for getStoresNeumadsReview data:', data);
//     // console.log('Data for getStoresNeumadsReview:', getStoresNeumadsReview);
//     return data;
//   } catch (err) {
//     console.error(err);
//     // You can decide what to return in case of error, perhaps null or an empty array
//     return null;
//   }
// };

export const getArticlePost = async (limit = 9, skip = 0) => {
  try {
    const query = `
    query {
      appFastFoodHomePage031523Collection(limit: ${limit}, skip: ${skip}) {
        items {
          sys {
            id
            publishedAt
          }
          title
          location {
            ... on ContentTypeLocation {
              type
              geolocation {
                lat
                lon
              }
              address
              region
            }
          }
          headline {
            ... on Headline {
              text
              subtext
              eyebrow
            }
          }
          featured
          slug
          category {
            title
            categoryType
            genre
          }
          series {
            seriesName
          }
          media {
            ... on Media {
              title
              hero {
                url
              }
              thumbnail {
                url
              }
              galleryCollection {
                items {
                  url
                }
              }
            }
          }
          author {
            ... on Author {  # Use the correct type for author entries
              social
              authorPseudonym
              slug
              media {
                ... on Media {
                	thumbnail {
                  	url
                	}
                  hero {
                  	url
                  }
                }
              }
              authorBio {
                ... on  ContentDefault{
              	 	title
                  introduction {
                    json
                  }
                  body {
                    json
                  }
                  conclusion {
                    json
                  }
                  postscript {
                    json
                  }
                }
            	}
              authorSnippet {
                ... on SnippetDefault {
                  title
									subtext 
                }
              }
            }
          }
          summary {
            ... on Summary {
              text
              bestFor
              noiseLevel
              environment
              parking
            }
          }
          snippet {
            ... on Snippet {
              title
              text {
                json
              }
            }
          }
          
          content {
            ... on Content {
              introduction {
                json
              }
              type
              stores{
                json
              }
              body {
                json
              }
              bodyCurrated 
              bodyTable
              conclusion {
                json
              }
            }
          }
          postscript {
            ...on Postscript {
              text {
                json
              }
            }
          }
          reference {
            ... on ReferenceDefault {
              relatedReferencesCollection(limit: 3) {
                items {
                  ... on AppFastFoodHomePage031523 {
                    title
                    category {
                      categoryType
                      genre
                    }
                    media {
                      ... on Media {
                        thumbnail {
                          url
                        }
                      }
                    }
                    slug
                    snippet {
                      ... on Snippet {
                        title
                        text {
                          json
                        }
                      }
                    }
                    tagsCollection {
                      items {
                        tags
                        metatag
                      }
                    }
                  }
                }
              }
              suggestedReferencesCollection(limit: 3) {
                items {
                  ... on AppFastFoodHomePage031523 {
                    title
                    category {
                      categoryType
                      genre
                    }
                    media {
                      ... on Media {
                        thumbnail {
                          url
                        }
                      }
                    }
                    slug
                    snippet {
                      ... on Snippet {
                        title
                        text {
                          json
                        }
                      }
                    }
                    tagsCollection {
                      items {
                        tags
                        metatag
                      }
                    }
                  }
                }
              }
              similarReferencesCollection(limit: 3) {
                items {
                  ... on AppFastFoodHomePage031523 {
                    title
                    category {
                      categoryType
                      genre
                    }
                    media {
                      ... on Media {
                        thumbnail {
                          url
                        }
                      }
                    }
                    slug
                    snippet {
                      ... on Snippet {
                        title
                        text {
                          json
                        }
                      }
                    }
                    tagsCollection {
                      items {
                        tags
                        metatag
                      }
                    }
                  }
                }
              }
            }
          }
          tagsCollection {
            items {
              tags
              metatag
              serviceTags
              attributeTags
              accessibilityTags
              offeringTags
              storeTags
              environmentTags
              reviewTags
              locationTags
            }
          }
        } 
      }
    }
    
    
      `;
    const response = await fetch(
      "https://graphql.contentful.com/content/v1/spaces/i1hcb4885ci0?access_token=Bcy-B6Lvepv3RLYinX-rY9x4KDpxJcv8_IH0PgF6odw&locale=*",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      }
    );

    const json = await response.json();

    if (json.errors) {
      console.error("articleNeumadsTrail GraphQL errors:", json.errors);
    }

    if (!json.data) {
      return []; // Return an empty array if no data is found
    }

    const blogs = json.data.appFastFoodHomePage031523Collection.items;
    // console.log("store", blogs);

    const data = blogs.map((blogs) => {
      return {
        ...blogs,
        title: blogs?.title,

        // id: blogs?.sys?.id,
        publishedAt: blogs?.sys?.publishedAt,

        location: {
          type: blogs?.location?.type,
          geolocation: {
            lat: blogs?.location?.geolocation?.lat,
            lon: blogs?.location?.geolocation?.lon,
          },
          address: blogs?.location?.address,
          region: blogs?.location?.region,
        },
        slug: blogs?.slug,
        featured: blogs?.featured,
        headline: {
          text: blogs?.headline?.text,
          eyebrow: blogs?.headline?.eyebrow,
          subtext: blogs?.headline?.subtext,
        },
        categories: {
          categoryType: blogs?.category?.categoryType,
          genre: blogs?.category?.genre,
        },
        series: {
          seriesName: blogs?.series?.seriesName,
        },
        author: {
          name: blogs?.author?.authorPseudonym,
          media: {
            thumbnail: blogs?.author?.media?.thumbnail?.url,
            hero: blogs?.author?.media?.hero?.url,
          },
          slug: blogs?.author?.slug,
          social: blogs?.author?.social,
          authorBio: {
            title: blogs?.author?.authorBio?.title,
            introduction: blogs?.author?.authorBio?.introduction,
            body: blogs?.author?.authorBio?.body,
            conclusion: blogs?.author?.authorBio?.conclusion,
            postscript: blogs?.author?.authorBio?.postscript,
          },
          authorSnippet: {
            title: blogs?.author?.authorSnippet?.title,
            text: blogs?.author?.authorSnippet?.subtext,
          },
        },
        media: {
          hero: blogs?.media?.hero?.url,
          thumbnail: blogs?.media?.thumbnail?.url,
          gallery: blogs?.media?.galleryCollection?.items.map((item) => ({
            url: item?.url,
          })),
        },
        // snippet: {
        //   title: blogs?.snippet?.title,
        //   text: documentToHtmlString(blogs?.snippet?.text?.json),
        // },
        snippet: {
          title: blogs?.snippet?.title,
          text: blogs?.snippet?.text,
        },
        summary: {
          text: blogs?.summary?.text,
        },
        content: {
          introduction: documentToHtmlString(
            blogs?.content?.introduction?.json
          ),
          stores: documentToHtmlString(blogs?.content?.stores?.json),
          body: documentToHtmlString(blogs?.content?.body?.json),
          bodyCurrated: documentToHtmlString(
            blogs?.content?.bodyCurrated?.json
          ),
          bodyTable: documentToHtmlString(blogs?.content?.bodyTable?.json),
          conclusion: documentToHtmlString(blogs?.content?.conclusion?.json),
        },
        postscript: {
          text: documentToHtmlString(blogs?.postscript?.text?.json),
        },
        reference: {
          relatedReferences:
            blogs?.reference?.relatedReferencesCollection?.items.map(
              (item) => ({
                title: item.title,
                headline: item.headline,
                section: item.section,
                // media: {
                //   thumbnail: item.media.thumbnail.url,
                // },
                overview: item.overview,
                slug: item.slug,
                tag: item.tag,
                relatedCategory: item.categoryType,
              })
            ),
          suggestedReferences:
            blogs?.reference?.suggestedReferencesCollection?.items.map(
              (item) => ({
                title: item.title,
                section: item.section,
                // media: {
                //   thumbnail: item.media.thumbnail.url,
                // },
                overview: item.overview,
                slug: item.slug,
                tag: item.tag,
              })
            ),
          similarReferences:
            blogs?.reference?.similarReferencesCollection?.items.map(
              (item) => ({
                title: item.title,
                section: item.section,
                // media: {
                //   thumbnail: item.media.thumbnail.url,
                // },
                overview: item.overview,
                slug: item.slug,
                tag: item.tag,
              })
            ),
        },
        tag: blogs?.tagsCollection?.items.map((item) => ({
          tags: item?.tags,
          tagMetatag: item?.metatag,
          serviceTags: item?.serviceTags,
          attributeTags: item?.attributeTags,
          accessibilityTags: item?.accessibilityTags,
          offeringTags: item?.offeringTags,
          storeTags: item?.storeTags,
          environmentTags: item?.environmentTags,
          reviewTags: item?.reviewTags,
          locationTags: item?.locationTags,
        })),
      };
    });
    documentToPlainTextString(getArticlePost);
    // console.log('Data for getStoresNeumadsReview data:', data);
    // console.log('Data for getStoresNeumadsReview:', getStoresNeumadsReview);
    return data;
  } catch (err) {
    console.error(err);
    // You can decide what to return in case of error, perhaps null or an empty array
    return null;
  }
};

// getAllBlogs
// export const getAllBlogs = async (limit = 9, skip = 0) => {
//   try {

//     const articleData = await getArticleNeumadsTrail(limit, skip);
//     const storeData = await getStoresNeumadsReview(limit, skip);
//     const blogs = [...articleData, ...storeData];

//     // const stores = json.data.storesNeumadsReviewCollection.items;
//     // // console.log("store", stores);
//     console.log("blogs  !!", blogs);
//     const item = blogs.data.items;

//     console.log("item", item);

//     // const data = [...articleData, ...storeData].map((item) => ({
//     const data = blogs.map((item) => {
//         return {
//       title: item.title,
//       slug: item.slug,
//       featured: item.featured,
//       headline: item.headline.text,
//       type: item.location.type,
//       lat: item.location.geolocation.lat,
//       lng: item.location.geolocation.lng,
//       address: item.location.address,
//       region: item.location.region,
//       snippet: documentToPlainTextString(item.snippet.text),
//       summary: documentToPlainTextString(item.summary.text),
//       thumbnail: item.media.thumbnail.url,
//       gallery: item.media.gallery.map((galleryItem) => galleryItem.url),
//       hero: item.media.hero.url,
//       introduction: documentToHtmlString(item.content.introduction),
//       body: documentToHtmlString(item.content.body),
//       conclusion: documentToHtmlString(item.content.conclusion),
//       relatedReferences: item.references.relatedReferences.map(
//         (ref) => ref.title
//       ),
//       suggestedReferences: item.references.suggestedReferences.map(
//         (ref) => ref.title
//       ),
//       similarReferences: item.references.similarReferences.map(
//         (ref) => ref.title
//       ),
//       postscript: documentToHtmlString(item.postscript.text),
//       tags: item.tags.map((tagItem) => tagItem.tags),
//       metatag: item.tags.map((tagItem) => tagItem.metatag),
//       };
//     });
//     console.log("all blogs",blogsdata);
//     // documentToPlainTextString(getAllBlogs);
//     // console.log('Data for getStoresNeumadsReview data:', data);
//     // console.log('Data for getStoresNeumadsReview:', getStoresNeumadsReview);
//     return data;
//   } catch (err) {
//     console.error(err);
//     // You can decide what to return in case of error, perhaps null or an empty array
//     return null;
//   }
// };

// src/api.js
const API = {
  fetchLocationDetails: async (input, token) => {
    try {
      const response = await fetch(
        `https://api.foursquare.com/v2/venues/search?near=${input}&v=20210501&limit=5&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&sessionToken=${token}`,
        { method: "GET" }
      );

      const json = await response.json();

      if (json.errors) {
        console.error("API errors:", json.errors);
      }

      if (!json.response) {
        return []; // Return an empty array if no data is found
      }

      const venues = json.response.venues;

      const data = venues.map((venue) => {
        // Implement your data transformation logic here
      });

      // console.log('Data:', data);
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  },
};

export default API;


// export const getBlogs = async (limit = 9, skip = 0) => {
//   try {
//     // Pagination
//     const response = await client.getEntries({
//       content_type: "appFastFoodHomePage031523",
//       limit,
//       skip,
//     });
//     // console.log("blog response" + response);
//     let blogs = response.items;
//     console.log("blogs" + blogs);
//     blogs = blogs.map((item) => {
//       const { id, createdAt } = item.sys;
//       const { title, featured, slug } = item.fields;
//       const type = item.fields.location.fields.type;
//       const lat = item.fields.location.fields.geolocation.lat;
//       const lng = item.fields.location.fields.geolocation.lng;
//       const address = item.fields.location.fields.address;
//       const thumbnail = item.fields.media.fields.thumbnail.fields.file.url;
//       const snippet = item.fields.snippet.fields.text.json;
//       const headline = item.fields.headline.fields.text;
//       const category = item.fields.category.fields.category;

//       return {
//         id,
//         title,
//         featured,
//         type,
//         headline,
//         category,
//         seriesName,
//         snippet,
//         thumbnail,
//         lat,
//         lng,
//         address,
//         snippet,

//       };
//     });
//     console.log('Data for getAllBlogs:', getBlogs);
//     documentToPlainTextString(getBlogs);
//     return blogs;
//   } catch (err) {
//     console.log(err);
//   }

// };

// export const getAllBlogs = async (limit = 9, skip = 0) => {
//   try {
//     const query = `
//     query {
//       appFastFoodHomePage031523Collection(where: {featured: false}, limit: 3, skip: 0) {
//         items {
//           title
//           location {
//             ... on ContentTypeLocation {
//               type
//               geolocation {
//                 lat
//                 lng
//               }
//               address
//               region
//             }
//           }
//           featured
//           headline {
//             text
//             eyebrow
//           }
//           slug
//           featured
//           category {
//             category
//           }
//           series {
//             seriesName
//           }
//           author {
//             authorName
//             authorPseudonym
//             authorPicture {
//               url
//             }
//             slug
//           }
//           media {
//             ... on Media {
//               title
//               hero {
//                 url
//               }
//               thumbnail {
//                 url
//               }
//               galleryCollection {
//                 items {
//                   url
//                 }
//               }
//             }
//           }
//           snippet {
//             ... on Snippet {
//               title
//               text {
//                 json
//               }
//             }
//           }
//           summary {
//             ... on Summary {
//               text
//             }
//           }
//           content {
//             ... on Content {
//               introduction {
//                 json
//               }
//               body {
//                 json
//               }
//               conclusion {
//                 json
//               }
//             }
//           }
//           postscript {
//             ... on Postscript {
//               text {
//                 json
//               }
//             }
//           }
//           reference {
//             ... on ReferenceDefault {
//               relatedReferencesCollection(limit: 3) {
//                 items {
//                   ... on AppFastFoodHomePage031523 {
//                     title
//                     category {
//                       category
//                     }
//                     series {
//                       seriesName
//                     }
//                     media {
//                       ... on Media {
//                         thumbnail {
//                           url
//                         }
//                       }
//                     }
//                     slug
//                     snippet {
//                       ... on Snippet {
//                         title
//                         text {
//                           json
//                         }
//                       }
//                     }
//                     tagsCollection {
//                       items {
//                         tags
//                         metatag
//                       }
//                     }
//                   }
//                 }
//               }
//               suggestedReferencesCollection(limit: 3) {
//                 items {
//                   ... on AppFastFoodHomePage031523 {
//                     title
//                     category {
//                       category
//                     }
//                     series {
//                       seriesName
//                     }
//                     media {
//                       ... on Media {
//                         thumbnail {
//                           url
//                         }
//                       }
//                     }
//                     slug
//                     snippet {
//                       ... on Snippet {
//                         title
//                         text {
//                           json
//                         }
//                       }
//                     }
//                     tagsCollection {
//                       items {
//                         tags
//                         metatag
//                       }
//                     }
//                   }
//                 }
//               }
//               similarReferencesCollection(limit: 3) {
//                 items {
//                   ... on AppFastFoodHomePage031523 {
//                     title
//                     category {
//                       category
//                     }
//                     series {
//                       seriesName
//                     }
//                     media {
//                       ... on Media {
//                         thumbnail {
//                           url
//                         }
//                       }
//                     }
//                     slug
//                     snippet {
//                       ... on Snippet {
//                         title
//                         text {
//                           json
//                         }
//                       }
//                     }
//                     tagsCollection {
//                       items {
//                         tags
//                         metatag
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     }
//     `;
//     const response = await fetch(
//       "https://graphql.contentful.com/content/v1/spaces/i1hcb4885ci0?access_token=Bcy-B6Lvepv3RLYinX-rY9x4KDpxJcv8_IH0PgF6odw&locale=*",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ query }),
//       }
//     );

//     const json = await response.json();
//     // console.log('getNonFeaturedBlog JSON:', json); // Debugging information

//     if (json.errors) {
//       console.error("getNonFeaturedBlog GraphQL errors:", json.errors);
//     }
//     if (!json.data || !json.data.appFastFoodHomePage031523Collection) {
//       return []; // Return an empty array if no data is found
//     }

//     // const blogs = json.data.appFastFoodHomePage031523Collection.items;
//     // const articles = json.data.articleNeumadsTrailCollection.items;

//     // const blogs = json.data.appFastFoodHomePage031523Collection.items;
//     // const articles = json.data.articleNeumadsTrailCollection.items;
//     // // console.log("store", stores)

//     // const data = blogs.map((blogs, articles) => {
//     //   return {
//   const data = blogs.map((blogs) => {
//     return {
//       ...blogs,
//       title: blogs?.title,
//       location: {
//         type: blogs?.location?.type,
//         geolocation: {
//           lat: blogs?.location?.geolocation?.lat,
//           lng: blogs?.location?.geolocation?.lng,
//         },
//         address: blogs?.location?.address,
//         region: blogs?.location?.region,
//       },
//       slug: blogs?.slug,
//       featured: blogs?.featured,
//       headline: {
//         text: blogs?.headline?.text,
//         slug: blogs?.headline?.slug,
//       },
//       category: {
//         category: blogs?.category?.category,
//       },
//       series: {
//         seriesName: blogs?.series?.seriesName,
//       },
//       author: {
//         name: blogs?.author?.authorPseudonym,
//         picture: blogs?.author?.authorPicture?.url,
//         slug: blogs?.author?.slug,
//       },
//       media: {
//         hero: blogs?.media?.hero?.url,
//         thumbnail: blogs?.media?.thumbnail?.url,
//         gallery: blogs?.media?.galleryCollection?.items.map(item => ({
//           url: item?.url,
//         })),
//       },
//       snippet: {
//         title: blogs?.snippet?.title,
//         text: documentToHtmlString(blogs?.snippet?.text?.json),
//       },
//       summary: {
//         text: blogs?.summary?.text,
//       },
//       content: {
//         introduction: documentToHtmlString(blogs?.content?.introduction?.json),
//         body: documentToHtmlString(blogs?.content?.body?.json),
//         conclusion: documentToHtmlString(blogs?.content?.conclusion?.json),
//       },
//       attributes: {
//         amentities: blogs?.attributes?.amentities,
//         offers: blogs?.attributes?.offers,
//       },
//       postscript: {
//         text: documentToHtmlString(blogs?.postscript?.text?.json),
//       },
//       references: {
//         relatedReferences: blogs?.reference?.relatedReferencesCollection?.items.map(item => ({
//           title: item.title,headline: item.headline,
//           section: item.section,
//           // media: {
//           //   thumbnail: item.media.thumbnail.url,
//           // },
//           overview: item.overview,
//           slug: item.slug,
//           tag: item.tag,
//           category: item.category,
//         })),
//         suggestedReferences: blogs?.reference?.suggestedReferencesCollection?.items.map(item => ({
//           title: item.title,
//           section: item.section,
//           // media: {
//           //   thumbnail: item.media.thumbnail.url,
//           // },
//           overview: item.overview,
//           slug: item.slug,
//           tag: item.tag,
//         })),
//         similarReferences: blogs?.reference?.similarReferencesCollection?.items.map(item => ({
//           title: item.title,
//           section: item.section,
//           // media: {
//           //   thumbnail: item.media.thumbnail.url,
//           // },
//           overview: item.overview,
//           slug: item.slug,
//           tag: item.tag,
//         })),
//       },
//       tag: blogs?.tagsCollection?.items.map(item => ({
//         tags: item?.tags,
//         metatag: item?.metatag,
//       })),
//     };
//   });
//   documentToPlainTextString(getAllBlogs);
//   console.log('Data for getStoresNeumadsReview data:', data);
//   console.log('Data for getStoresNeumadsReview:', getStoresNeumadsReview);
//   return data;
// } catch (err) {
//   console.error(err);
//   // You can decide what to return in case of error, perhaps null or an empty array
//   return null;
// }
// };

// export const getAllPosts = async (limit = 9, skip = 0) => {
//   try {
//     const query = `
//     query {
//       appFastFoodHomePage031523Collection(where: {featured: false}, limit: 3, skip: 0) {
//         items {
//           title
//           location {
//             ... on ContentTypeLocation {
//               type
//               geolocation {
//                 lat
//                 lng
//               }
//               address
//               region
//             }
//           }
//           featured
//           headline {
//             text
//             eyebrow
//           }
//           slug
//           featured
//           category {
//             category
//           }
//           series {
//             seriesName
//           }
//           author {
//             authorName
//             authorPseudonym
//             authorPicture {
//               url
//             }
//             slug
//           }
//           media {
//             ... on Media {
//               title
//               hero {
//                 url
//               }
//               thumbnail {
//                 url
//               }
//               galleryCollection {
//                 items {
//                   url
//                 }
//               }
//             }
//           }
//           snippet {
//             ... on Snippet {
//               title
//               text {
//                 json
//               }
//             }
//           }
//           summary {
//             ... on Summary {
//               text
//             }
//           }
//           content {
//             ... on Content {
//               introduction {
//                 json
//               }
//               body {
//                 json
//               }
//               conclusion {
//                 json
//               }
//             }
//           }
//           postscript {
//             ... on Postscript {
//               text {
//                 json
//               }
//             }
//           }
//           reference {
//             ... on ReferenceDefault {
//               relatedReferencesCollection(limit: 3) {
//                 items {
//                   ... on AppFastFoodHomePage031523 {
//                     title
//                     category {
//                       category
//                     }
//                     series {
//                       seriesName
//                     }
//                     media {
//                       ... on Media {
//                         thumbnail {
//                           url
//                         }
//                       }
//                     }
//                     slug
//                     snippet {
//                       ... on Snippet {
//                         title
//                         text {
//                           json
//                         }
//                       }
//                     }
//                     tagsCollection {
//                       items {
//                         tags
//                         metatag
//                       }
//                     }
//                   }
//                 }
//               }
//               suggestedReferencesCollection(limit: 3) {
//                 items {
//                   ... on AppFastFoodHomePage031523 {
//                     title
//                     category {
//                       category
//                     }
//                     series {
//                       seriesName
//                     }
//                     media {
//                       ... on Media {
//                         thumbnail {
//                           url
//                         }
//                       }
//                     }
//                     slug
//                     snippet {
//                       ... on Snippet {
//                         title
//                         text {
//                           json
//                         }
//                       }
//                     }
//                     tagsCollection {
//                       items {
//                         tags
//                         metatag
//                       }
//                     }
//                   }
//                 }
//               }
//               similarReferencesCollection(limit: 3) {
//                 items {
//                   ... on AppFastFoodHomePage031523 {
//                     title
//                     category {
//                       category
//                     }
//                     series {
//                       seriesName
//                     }
//                     media {
//                       ... on Media {
//                         thumbnail {
//                           url
//                         }
//                       }
//                     }
//                     slug
//                     snippet {
//                       ... on Snippet {
//                         title
//                         text {
//                           json
//                         }
//                       }
//                     }
//                     tagsCollection {
//                       items {
//                         tags
//                         metatag
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     }
//     `;
//     const response = await fetch(
//       "https://graphql.contentful.com/content/v1/spaces/i1hcb4885ci0?access_token=Bcy-B6Lvepv3RLYinX-rY9x4KDpxJcv8_IH0PgF6odw&locale=*",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ query }),
//       }
//     );

//     const json = await response.json();
//     // console.log('getNonFeaturedBlog JSON:', json); // Debugging information

//     if (json.errors) {
//       console.error("getNonFeaturedBlog GraphQL errors:", json.errors);
//     }
//     if (!json.data || !json.data.appFastFoodHomePage031523Collection) {
//       return []; // Return an empty array if no data is found
//     }

//     // const blogs = json.data.appFastFoodHomePage031523Collection.items;
//     // const articles = json.data.articleNeumadsTrailCollection.items;

//     const blogs = json.data.appFastFoodHomePage031523Collection.items;
//     const articles = json.data.articleNeumadsTrailCollection.items;
//     // console.log("store", stores)

//     // const data = blogs.map((blogs, articles) => {
//     //   return {
//     const data = {
//       title: blogs.map((item) => item.title).concat(articles.map((item) => item.title)),
//       headline: blogs.map((item) => item.headline.text).concat(articles.map((item) => item.headline.text)),
//       slug: blogs.map((item) => item.slug).concat(articles.map((item) => item.slug)),
//       featured: blogs.map((item) => item.featured).concat(articles.map((item) => item.featured)),
//       type: blogs.map((item) => item.location.type).concat(articles.map((item) => item.location.type)),
//       lat: blogs.map((item) => item.location.geolocation.lat).concat(articles.map((item) => item.location.geolocation.lat)),
//       lng: blogs.map((item) => item.location.geolocation.lng).concat(articles.map((item) => item.location.geolocation.lng)),
//       address: blogs.map((item) => item.location.address).concat(articles.map((item) => item.location.address)),
//       region: blogs.map((item) => item.location.region).concat(articles.map((item) => item.location.region)),
//       snippet: blogs.map((item) => item.location.region).concat(articles.map((item) => item.location.region)),
//       summary: blogs.map((item) => item.location.region).concat(articles.map((item) => item.location.region)),
//     };
//     // documentToPlainTextString(appFastFoodHomePage031523Collection, articleNeumadsTrailCollection);
//     // documentToPlainTextString(appFastFoodHomePage031523Collection);
//     // documentToPlainTextString(articleNeumadsTrailCollection);

//     // console.log('Data for getStoresNeumadsReview data:', data);
//     console.log('Data for getAllBlogs:', data);
//     return data;
//   } catch (err) {
//     console.error(err);
//     // You can decide what to return in case of error, perhaps null or an empty array
//     return null;
//   }
// };

//     console.log('Data for getAllBlogs:', getAllBlogs);
//     documentToPlainTextString(getAllBlogs);
//     // console.log('Data for getStoresNeumadsReview data:', data);
//     // console.log('Data for getStoresNeumadsReview:', getStoresNeumadsReview);
//     return data;
//   } catch (err) {
//     console.error(err);
//     // You can decide what to return in case of error, perhaps null or an empty array
//     return null;
//   }
// };

// const response = await fetch(
//   "https://graphql.contentful.com/content/v1/spaces/i1hcb4885ci0?access_token=Bcy-B6Lvepv3RLYinX-rY9x4KDpxJcv8_IH0PgF6odw&locale=*",
//   {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ query }),
//   }
// );
// const json = await response.json();
// console.log('getAllBlogs JSON:', json); // Debugging information

// if (json.errors) {
//   console.error("getAllBlogs GraphQL errors:", json.errors);
// }

// if (!json.data) {
//   return []; // Return an empty array if no data is found
// }
// const blogs = json.data.appFastFoodHomePage031523Collection.items;
// // console.log("store", blogs)
//   const data = blogs.map((blogs) => {
//   return {
//     ...blogs,
//     title: blogs?.title,
//     location: {
//       type: blogs?.location?.type,
//       geolocation: {
//         lat: blogs?.location?.geolocation?.lat,
//         lng: blogs?.location?.geolocation?.lng,
//       },
//       address: blogs?.location?.address,
//       region: blogs?.location?.region,
//     },
//     slug: blogs?.slug,
//     featured: blogs?.featured,
//     store: {
//       storeName: blogs?.store?.storeName,
//       storeNickname: blogs?.store?.storeNickname,
//       hours: blogs?.store?.hours,
//       storeWebsite: blogs?.store?.storeWebsite,
//       storeGeolocation: {
//         lat: blogs?.store?.storeGeolocation?.lat,
//         lng: blogs?.store?.storeGeolocation?.lng,
//       },
//       storeAddress: {
//         lat: blogs?.store?.storeAddress?.lat,
//         lng: blogs?.store?.storeAddress?.lng,
//       },
//       storeChain: blogs?.store?.storeChain,
//       storeChainStoresCollection: blogs?.store?.storeChainStoresCollection?.items.map(item => ({
//         storeName: item?.storeName,
//         storeNickname: item?.storeNickname,
//         hours: item?.hours,
//         storeWebsite: item?.storeWebsite,
//         storeGeolocation: {
//           lat: item?.storeGeolocation?.lat,
//           lng: item?.storeGeolocation?.lng,
//         },
//         storeAddress: item?.storeAddress,
//         storeChain: item?.storeChain,
//         storeChainStoresCollection: item?.storeChainStoresCollection?.items.map(item => ({
//           storeName: item?.storeName,
//           storeNickname: item?.storeNickname,
//           hours: item?.hours,
//           storeWebsite: item?.storeWebsite,
//         })),
//         neustar: item?.neustar,
//         storeRating: item?.storeRating,
//         storeRatingsCount: item?.storeRatingsCount,
//         storeReviewOverview: item?.storeReviewOverview,
//         handles: item?.handles,
//         contact: item?.contact,
//         storeReviewSource: item?.storeReviewSource,
//         storeBio: {
//           title: item?.storeBio?.title,
//           introduction: item?.storeBio?.introduction?.json,
//           body: item?.storeBio?.body?.json,
//           conclusion: item?.storeBio?.conclusion?.json,
//           postscript: item?.storeBio?.postscript?.json,
//         },
//         storeTagsCollection: item?.storeTagsCollection?.items.map(item => ({
//           tags: item?.tags,
//           metatag: item?.metatag,
//         })),
//       })),
//     },
//     headline: {
//       text: blogs?.headline?.text,
//       slug: blogs?.headline?.slug,
//     },
//     category: {
//       category: blogs?.category?.category,
//     },
//     series: {
//       seriesName: blogs?.series?.seriesName,
//     },
//     author: {
//       name: blogs?.author?.authorPseudonym,
//       picture: blogs?.author?.authorPicture?.url,
//       slug: blogs?.author?.slug,
//     },
//     media: {
//       hero: blogs?.media?.hero?.url,
//       thumbnail: blogs?.media?.thumbnail?.url,
//       gallery: blogs?.media?.galleryCollection?.items.map(item => ({
//         url: item?.url,
//       })),
//     },
//     snippet: {
//       title: blogs?.snippet?.title,
//       text: documentToHtmlString(blogs?.snippet?.text?.json),
//     },
//     summary: {
//       text: blogs?.summary?.text,
//     },
//     content: {
//       introduction: documentToHtmlString(blogs?.content?.introduction?.json),
//       body: documentToHtmlString(blogs?.content?.body?.json),
//       conclusion: documentToHtmlString(blogs?.content?.conclusion?.json),
//     },
//     attributes: {
//       amentities: blogs?.attributes?.amentities,
//       offers: blogs?.attributes?.offers,
//     },
//     postscript: {
//       text: documentToHtmlString(blogs?.postscript?.text?.json),
//     },
//     references: {
//       relatedReferences: blogs?.reference?.relatedReferencesCollection?.items.map(item => ({
//         title: item.title,headline: item.headline,
//         section: item.section,
//         // media: {
//         //   thumbnail: item.media.thumbnail.url,
//         // },
//         overview: item.overview,
//         slug: item.slug,
//         tag: item.tag,
//         category: item.category,
//       })),
//       suggestedReferences: blogs?.reference?.suggestedReferencesCollection?.items.map(item => ({
//         title: item.title,
//         section: item.section,
//         // media: {
//         //   thumbnail: item.media.thumbnail.url,
//         // },
//         overview: item.overview,
//         slug: item.slug,
//         tag: item.tag,
//       })),
//       similarReferences: blogs?.reference?.similarReferencesCollection?.items.map(item => ({
//         title: item.title,
//         section: item.section,
//         // media: {
//         //   thumbnail: item.media.thumbnail.url,
//         // },
//         overview: item.overview,
//         slug: item.slug,
//         tag: item.tag,
//       })),
//     },
//     tag: blogs?.tagsCollection?.items.map(item => ({
//       tags: item?.tags,
//       metatag: item?.metatag,
//     })),
//   };
// });
// documentToPlainTextString(getAllBlogs);
// console.log('Data for getStoresNeumadsReview data:', data);
// console.log('Data for getStoresNeumadsReview:', getStoresNeumadsReview);
//   return data;
// } catch (err) {
//   console.error(err);
//   // You can decide what to return in case of error, perhaps null or an empty array
//   return null;
// }
// };

//     const response = await fetch(
//       "https://graphql.contentful.com/content/v1/spaces/i1hcb4885ci0?access_token=Bcy-B6Lvepv3RLYinX-rY9x4KDpxJcv8_IH0PgF6odw&locale=*",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ query }),
//       }
//     );

//     const json = await response.json();
//     // console.log('getNonFeaturedBlog JSON:', json); // Debugging information

//     if (json.errors) {
//       console.error("getNonFeaturedBlog GraphQL errors:", json.errors);
//     }
//     if (!json.data || !json.data.appFastFoodHomePage031523Collection) {
//       return []; // Return an empty array if no data is found
//     }

//     const appFastFoodItems = json.data.appFastFoodHomePage031523Collection.items;
//     const articleNeumadsItems = json.data.articleNeumadsTrailCollection.items;

//     // const data = {
//     //   title: appFastFoodItems.map((item) => item.title).concat(articleNeumadsItems.map((item) => item.title)),
//     //   headline: appFastFoodItems.map((item) => item.headline.text).concat(articleNeumadsItems.map((item) => item.headline.text)),
//     //   category: appFastFoodItems.map((item) => item.category).concat(articleNeumadsItems.map((item) => item.category)),
//     //   featured: appFastFoodItems.map((item) => item.featured).concat(articleNeumadsItems.map((item) => item.featured)),
//     //   subtext: appFastFoodItems.map((item) => item.overview).concat(articleNeumadsItems.map((item) => item.subtext)),
//     //   thumbnail: appFastFoodItems.map((item) => item.thumbnail.url).concat(articleNeumadsItems.map((item) => item.thumbnail.url)),
//     //   slug: appFastFoodItems.map((item) => item.slug).concat(articleNeumadsItems.map((item) => item.slug)),
//     //   section: appFastFoodItems.map((item) => item.section).concat(articleNeumadsItems.map((item) => item.section)),
//     // };

//     console.log('Nonfeatured data:', data);
//     return data;
//   } catch (err) {
//     console.log(err);
//   }
// };

export const getFeaturedBlog = async (limit = 6, skip = 1) => {
  try {
    const query = `
    query {
      appFastFoodHomePage031523Collection(where: {featured: true}, limit: ${limit}, skip: ${skip}) {
        items {
            title
            slug
            location {
                ... on ContentTypeLocation {
                  type
                  geolocation {
                    lat
                    lng
                  }
                  address
                  region
                }
              }
          
              headline {
                ... on Headline {
                  text
                  subtext
                  eyebrow
                }
              }
            featured
            category {
              categoryType
              genre
            }
            series {
              seriesName
            }
            media {
              ... on Media {
                thumbnail {
                  url
                }
              }
            }
            snippet {
              ... on Snippet {
                title
                text {
                  json
                }
              }
            }
            postscript {
              ... on Postscript {
                text {
                  json
                }
              }
            }
            reference {
              ... on ReferenceDefault {
                relatedReferencesCollection(limit: 3) {
                  items {
                    ... on AppFastFoodHomePage031523 {
                      title
                      section
                      thumbnail {
                        url
                      }
                      slug
                      overview
                      tagsCollection {
                        items {
                          tags
                          metatag
                        }
                      }
                    }
                  }
                }
                suggestedReferencesCollection(limit: 3) {
                  items {
                    ... on AppFastFoodHomePage031523 {
                      title
                      section
                      thumbnail {
                        url
                      }
                      slug
                      overview
                      tagsCollection {
                        items {
                          tags
                          metatag
                        }
                      }
                    }
                  }
                }
                similarReferencesCollection(limit: 3) {
                  items {
                    ... on AppFastFoodHomePage031523 {
                      title
                      section
                      thumbnail {
                        url
                      }
                      slug
                      overview
                      tagsCollection {
                        items {
                          tags
                          metatag
                        }
                      }
                    }
                  }
                }
              }
            }
            tagsCollection {
              items {
                tags
                metatag
              }
            }
          }
        }
      }
    
    `;

    const response = await fetch(
      "https://graphql.contentful.com/content/v1/spaces/i1hcb4885ci0?access_token=Bcy-B6Lvepv3RLYinX-rY9x4KDpxJcv8_IH0PgF6odw&locale=*",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
        limit,
        skip,
      }
    );

    const json = await response.json();
    // console.log('JSON:', json);

    if (json.errors) {
      console.error("GraphQL errors:", json.errors);
    }

    // if (!json.data || !json.data.appFastFoodHomePage031523Collection || !json.data.appFastFoodHomePage031523Collection.items) {
    //   throw new Error("Invalid data format");
    // }

    if (!json.data || !json.data.appFastFoodHomePage031523Collection) {
      return []; // Return an empty array if no data is found
    }
    const featuredBlogData =
      json.data.appFastFoodHomePage031523Collection.items;
    const data = featuredBlogData;

    console.log("Data:", data);
    return data;
  } catch (err) {
    console.log(err);
  }
};

export const getPrimaryFeaturedBlog = async (limit = 1, skip = 0) => {
  try {
    const query = `
    query {
      appFastFoodHomePage031523Collection(where: {featured: true}, limit: ${limit}, skip: ${skip}) {
        items {
          sys {
            id
            publishedAt
          }
          title
          featured
          section
          overview
          introduction
          slug
          authorName
          category {
            categoryType
            genre
          }
          tag
          metatag
          featuredImage {
            title
            url
          }
          thumbnail {
            title
            url
          }
          authorImage {
            title
            url(transform: {cornerRadius: 300, width: 150, height: 150})
          }
        }
      }
    }
    `;

    const response = await fetch(
      "https://graphql.contentful.com/content/v1/spaces/i1hcb4885ci0?access_token=Bcy-B6Lvepv3RLYinX-rY9x4KDpxJcv8_IH0PgF6odw&locale=*",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
        limit,
        skip,
      }
    );

    const json = await response.json();
    console.log("primaryFeaturedBlogData JSON:", json); // Debugging information

    if (json.errors) {
      console.error("primaryFeaturedBlogData GraphQL errors:", json.errors);
    }

    // if (!json.data || !json.data.appFastFoodHomePage031523Collection || !json.data.appFastFoodHomePage031523Collection.items) {
    //   throw new Error("Invalid data format");
    // }

    if (!json.data || !json.data.appFastFoodHomePage031523Collection) {
      return []; // Return an empty array if no data is found
    }
    const primaryFeaturedBlogData =
      json.data.appFastFoodHomePage031523Collection.items;
    const data = primaryFeaturedBlogData;

    console.log("Data:", data);
    return data;
  } catch (err) {
    console.log(err);
  }
};

export const getWorkFeaturedBlog = async (limit = 3, skip = 0) => {
  try {
    const query = `
    query {
      appFastFoodHomePage031523Collection(where: {AND: [{featured: true} {section: "Work"}]}, limit: 6, skip: 0) {
        items {
            sys {
              id
              publishedAt
            }
            title
            featured
            section
            overview
            introduction
            slug
            authorName
            category {
              categoryType
              genre
            }
            tag
            metatag
            featuredImage {
              title
              url
            }
            thumbnail {
              title
              url
            }
            authorImage {
              title
              url(transform: {cornerRadius: 300, width: 150, height: 150})
            }
          }
        }
      }
      `;

    const response = await fetch(
      "https://graphql.contentful.com/content/v1/spaces/i1hcb4885ci0?access_token=Bcy-B6Lvepv3RLYinX-rY9x4KDpxJcv8_IH0PgF6odw&locale=*",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
        limit,
        skip,
      }
    );

    const json = await response.json();
    console.log("WorkFeaturedBlog SON:", json); // Debugging information

    if (json.errors) {
      console.error("WorkFeaturedBlog GraphQL errors:", json.errors);
    }

    // if (!json.data || !json.data.appFastFoodHomePage031523Collection || !json.data.appFastFoodHomePage031523Collection.items) {
    //   throw new Error("Invalid data format");
    // }

    if (!json.data || !json.data.appFastFoodHomePage031523Collection) {
      return []; // Return an empty array if no data is found
    }
    const workFeaturedBlogData =
      json.data.appFastFoodHomePage031523Collection.items;
    const data = workFeaturedBlogData;

    console.log("Data:", data);
    return data;
  } catch (err) {
    console.log(err);
  }
};

export const getWorkBlog = async (limit = 9, skip = 0) => {
  try {
    const query = `
    query {
      appFastFoodHomePage031523Collection(where: {AND: [{featured: false} {section: "Work"}]}, limit: 6, skip: 0) {
        items {
          sys {
            id
            publishedAt
          }
          title
          featured
          section
          overview
          introduction
          slug
          authorName
          category {
            categoryType
            genre
          }
          tag
          metatag
          featuredImage {
            title
            url
          }
          thumbnail {
            title
            url
          }
          authorImage {
            title
            url(transform: {cornerRadius: 300, width: 150, height: 150})
          }
        }
      }
    }
    `;

    const response = await fetch(
      "https://graphql.contentful.com/content/v1/spaces/i1hcb4885ci0?access_token=Bcy-B6Lvepv3RLYinX-rY9x4KDpxJcv8_IH0PgF6odw&locale=*",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
        limit,
        skip,
      }
    );

    const json = await response.json();
    console.log("workBlogData JSON:", json); // Debugging information

    if (json.errors) {
      console.error("workBlogData GraphQL errors:", json.errors);
    }

    // if (!json.data || !json.data.appFastFoodHomePage031523Collection || !json.data.appFastFoodHomePage031523Collection.items) {
    //   throw new Error("Invalid data format");
    // }

    if (!json.data || !json.data.appFastFoodHomePage031523Collection) {
      return []; // Return an empty array if no data is found
    }
    const workBlogData = json.data.appFastFoodHomePage031523Collection.items;
    const data = workBlogData;

    console.log("Data:", data);
    return data;
  } catch (err) {
    console.log(err);
  }
};

export const getUnwindFeaturedBlog = async (limit = 3, skip = 0) => {
  try {
    const query = `
    query {
      appFastFoodHomePage031523Collection(where: {AND: [{featured: true} {section: "Unwind"}]}, limit: 6, skip: 0) {
        items {
            sys {
              id
              publishedAt
            }
            title
            featured
            section
            overview
            slug
            authorName
            category {
              categoryType
              genre
            }
            tag
            metatag
            featuredImage {
              title
              url
            }
            thumbnail {
              title
              url
            }
            authorImage {
              title
              url(transform: {cornerRadius: 300, width: 150, height: 150})
            }
          }
        }
      }
      `;

    const response = await fetch(
      "https://graphql.contentful.com/content/v1/spaces/i1hcb4885ci0?access_token=Bcy-B6Lvepv3RLYinX-rY9x4KDpxJcv8_IH0PgF6odw&locale=*",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
        limit,
        skip,
      }
    );

    const json = await response.json();
    console.log("UnwindFeaturedBlog SON:", json); // Debugging information

    if (json.errors) {
      console.error("UnwindFeaturedBlog GraphQL errors:", json.errors);
    }

    // if (!json.data || !json.data.appFastFoodHomePage031523Collection || !json.data.appFastFoodHomePage031523Collection.items) {
    //   throw new Error("Invalid data format");
    // }

    if (!json.data || !json.data.appFastFoodHomePage031523Collection) {
      return []; // Return an empty array if no data is found
    }
    const unwindFeaturedBlogData =
      json.data.appFastFoodHomePage031523Collection.items;
    const data = unwindFeaturedBlogData;

    console.log("Data:", data);
    return data;
  } catch (err) {
    console.log(err);
  }
};

export const getUnwindBlog = async (limit = 9, skip = 0) => {
  try {
    const query = `
    query {
      appFastFoodHomePage031523Collection(where: {AND: [{featured: false} {section: "Unwind"}]}, limit: 6, skip: 0) {
        items {
          sys {
            id
            publishedAt
          }
          title
          featured
          section
          overview
          slug
          authorName
          category {
            categoryType
            genre
          }
          tag
          metatag
          featuredImage {
            title
            url
          }
          thumbnail {
            title
            url
          }
          authorImage {
            title
            url(transform: {cornerRadius: 300, width: 150, height: 150})
          }
        }
      }
    }
    `;

    const response = await fetch(
      "https://graphql.contentful.com/content/v1/spaces/i1hcb4885ci0?access_token=Bcy-B6Lvepv3RLYinX-rY9x4KDpxJcv8_IH0PgF6odw&locale=*",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
        limit,
        skip,
      }
    );

    const json = await response.json();
    console.log("unwindBlogData JSON:", json); // Debugging information

    if (json.errors) {
      console.error("unwindBlogData GraphQL errors:", json.errors);
    }

    // if (!json.data || !json.data.appFastFoodHomePage031523Collection || !json.data.appFastFoodHomePage031523Collection.items) {
    //   throw new Error("Invalid data format");
    // }

    if (!json.data || !json.data.appFastFoodHomePage031523Collection) {
      return []; // Return an empty array if no data is found
    }
    const unwindBlogData = json.data.appFastFoodHomePage031523Collection.items;
    const data = unwindBlogData;

    console.log("Data:", data);
    return data;
  } catch (err) {
    console.log(err);
  }
};

export const getDineFeaturedBlog = async (limit = 3, skip = 0) => {
  try {
    const query = `
    query {
      appFastFoodHomePage031523Collection(where: {AND: [{featured: true} {section: "Dine"}]}, limit: 6, skip: 0) {
        items {
            sys {
              id
              publishedAt
            }
            title
            featured
            section
            overview
            introduction
            slug
            authorName
            category {
              categoryType
              genre
            }
            tag
            metatag
            featuredImage {
              title
              url
            }
            thumbnail {
              title
              url
            }
            authorImage {
              title
              url(transform: {cornerRadius: 300, width: 150, height: 150})
            }
          }
        }
      }
      `;

    const response = await fetch(
      "https://graphql.contentful.com/content/v1/spaces/i1hcb4885ci0?access_token=Bcy-B6Lvepv3RLYinX-rY9x4KDpxJcv8_IH0PgF6odw&locale=*",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
        limit,
        skip,
      }
    );

    const json = await response.json();
    console.log("DineFeaturedBlog SON:", json); // Debugging information

    if (json.errors) {
      console.error("DineFeaturedBlog GraphQL errors:", json.errors);
    }

    // if (!json.data || !json.data.appFastFoodHomePage031523Collection || !json.data.appFastFoodHomePage031523Collection.items) {
    //   throw new Error("Invalid data format");
    // }

    if (!json.data || !json.data.appFastFoodHomePage031523Collection) {
      return []; // Return an empty array if no data is found
    }
    const dineFeaturedBlogData =
      json.data.appFastFoodHomePage031523Collection.items;
    const data = dineFeaturedBlogData;

    console.log("Data:", data);
    return data;
  } catch (err) {
    console.log(err);
  }
};

export const getDineBlog = async (limit = 9, skip = 0) => {
  try {
    const query = `
    query {
      appFastFoodHomePage031523Collection(where: {AND: [{featured: false} {section: "Dine"}]}, limit: 6, skip: 0) {
        items {
          sys {
            id
            publishedAt
          }
          title
          featured
          section
          overview
          introduction
          slug
          authorName
          category {
            categoryType
            genre
          }
          tag
          metatag
          featuredImage {
            title
            url
          }
          thumbnail {
            title
            url
          }
          authorImage {
            title
            url(transform: {cornerRadius: 300, width: 150, height: 150})
          }
        }
      }
    }
    `;

    const response = await fetch(
      "https://graphql.contentful.com/content/v1/spaces/i1hcb4885ci0?access_token=Bcy-B6Lvepv3RLYinX-rY9x4KDpxJcv8_IH0PgF6odw&locale=*",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
        limit,
        skip,
      }
    );

    const json = await response.json();
    console.log("dineBlogData JSON:", json); // Debugging information

    if (json.errors) {
      console.error("dineBlogData GraphQL errors:", json.errors);
    }

    // if (!json.data || !json.data.appFastFoodHomePage031523Collection || !json.data.appFastFoodHomePage031523Collection.items) {
    //   throw new Error("Invalid data format");
    // }

    if (!json.data || !json.data.appFastFoodHomePage031523Collection) {
      return []; // Return an empty array if no data is found
    }
    const dineBlogData = json.data.appFastFoodHomePage031523Collection.items;
    const data = dineBlogData;

    console.log("Data:", data);
    return data;
  } catch (err) {
    console.log(err);
  }
};

export const getShortsFeaturedBlog = async (limit = 3, skip = 0) => {
  try {
    const query = `
    query {
      appFastFoodHomePage031523Collection(where: {AND: [{featured: true} {section: "Shorts"}]}, limit: 6, skip: 0) {
        items {
            sys {
              id
              publishedAt
            }
            title
            featured
            section
            overview
            introduction
            slug
            authorName
            category {
              categoryType
              genre
            }
            tag
            metatag
            featuredImage {
              title
              url
            }
            thumbnail {
              title
              url
            }
            authorImage {
              title
              url(transform: {cornerRadius: 300, width: 150, height: 150})
            }
          }
        }
      }
      `;

    const response = await fetch(
      "https://graphql.contentful.com/content/v1/spaces/i1hcb4885ci0?access_token=Bcy-B6Lvepv3RLYinX-rY9x4KDpxJcv8_IH0PgF6odw&locale=*",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
        limit,
        skip,
      }
    );

    const json = await response.json();
    console.log("ShortsFeaturedBlog SON:", json); // Debugging information

    if (json.errors) {
      console.error("ShortsFeaturedBlog GraphQL errors:", json.errors);
    }

    // if (!json.data || !json.data.appFastFoodHomePage031523Collection || !json.data.appFastFoodHomePage031523Collection.items) {
    //   throw new Error("Invalid data format");
    // }

    if (!json.data || !json.data.appFastFoodHomePage031523Collection) {
      return []; // Return an empty array if no data is found
    }
    const shortsFeaturedBlogData =
      json.data.appFastFoodHomePage031523Collection.items;
    const data = shortsFeaturedBlogData;

    console.log("Data:", data);
    return data;
  } catch (err) {
    console.log(err);
  }
};

export const getShortsBlog = async (limit = 9, skip = 0) => {
  try {
    const query = `
    query {
      appFastFoodHomePage031523Collection(where: {AND: [{featured: false} {section: "Shorts"}]}, limit: 6, skip: 0) {
        items {
          sys {
            id
            publishedAt
          }
          title
          featured
          section
          overview
          introduction
          slug
          authorName
          category {
            categoryType
            genre
          }
          tag
          metatag
          featuredImage {
            title
            url
          }
          thumbnail {
            title
            url
          }
          authorImage {
            title
            url(transform: {cornerRadius: 300, width: 150, height: 150})
          }
        }
      }
    }
    `;

    const response = await fetch(
      "https://graphql.contentful.com/content/v1/spaces/i1hcb4885ci0?access_token=Bcy-B6Lvepv3RLYinX-rY9x4KDpxJcv8_IH0PgF6odw&locale=*",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
        limit,
        skip,
      }
    );

    const json = await response.json();
    console.log("shortsBlogData JSON:", json); // Debugging information

    if (json.errors) {
      console.error("shortsBlogData GraphQL errors:", json.errors);
    }

    // if (!json.data || !json.data.appFastFoodHomePage031523Collection || !json.data.appFastFoodHomePage031523Collection.items) {
    //   throw new Error("Invalid data format");
    // }

    if (!json.data || !json.data.appFastFoodHomePage031523Collection) {
      return []; // Return an empty array if no data is found
    }
    const shortsBlogData = json.data.appFastFoodHomePage031523Collection.items;
    const data = shortsBlogData;

    console.log("Data:", data);
    return data;
  } catch (err) {
    console.log(err);
  }
};

export const getFeatured = async (limit = 6, skip = 0) => {
  try {
    // Pagination
    const response = await client.getEntries({
      content_type: "blogFeatured",
      limit,
      skip,
    });
    console.log(response);
    let featured = response.items;
    featured = featured.map((item) => {
      // const { id, createdAt } = item.sys;
      // const { title, featured, section, overview, slug, authorName, category, tag, metatag } = item.fields;
      // const thumbnail = item.fields.thumbnail.fields.file.url;
      // const authorImage = item.fields.authorImage.fields.file.url;
      const { featuredBlog } = item.fields;
      return {
        featured,
      };
    });
    return featured;
  } catch (err) {
    console.log(err);
  }
};

export const getBlog = async (slug) => {
  try {
    const response = await client.getEntries({
      content_type: "appFastFoodHomePage031523",
      "fields.slug": slug,
    });
    let blogdetails = response.items;
    blogdetails = blogdetails.map((item) => {
      const { id, createdAt } = item.sys;
      const {
        title,
        featured,
        section,
        overview,
        introduction,
        authorName,
        categoryType,
        genre,
        tag,
        metatag,
      } = item.fields;
      const details = item.fields.details;
      const featuredImage = item.fields.featuredImage.fields.file.url;
      return {
        id,
        title,
        featured,
        section,
        overview,
        introduction,
        featuredImage,
        details,
        authorName,
        createdAt,
        categoryType,
        genre,
        tag,
        metatag,
      };
    });
    return blogdetails;
  } catch (err) {
    console.log(err);
  }
};

// ADD FULL TEXT SEARCH QUERY
// if(query.searchBarText){
//   contentFullQuery['query'] = query.searchBarText;
// }


export async function getUserSettings() {
  const response = await fetch(`${API_URL}/user`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user settings');
  }

  return response.json();
}

export async function updateUserSettings(settings) {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const response = await fetch(`${API_URL}/settings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update user settings');
  }

  return response.json();
}

export async function login(email, password) {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  const data = await response.json();
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('userEmail', data.email);
  return data;
}

export async function signup(email, password) {
  const response = await fetch(`${API_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Signup failed');
  }

  const data = await response.json();
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('userEmail', data.email);
  return data;
}

export const sendImpression = async (storeId, action) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const response = await fetch(`${API_URL}/api/impression`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ storeId, action })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending impression:', error);
    throw error;
  }
};


// export default API;
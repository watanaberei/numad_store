import { documentToHtmlString } from "@contentful/rich-text-html-renderer";
import { parseRequestUrl } from "../utils.js";
import { getArticleNeumadsTrail } from "../api.js";  // make sure to import your function
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import { format, parseISO } from "date-fns";

const renderOptions = {
  // ... your render options ...
};

const ArticleNeumadsTrailScreen = {
  render: async () => {
    const request = parseRequestUrl();
    const articleTrail = await getArticleNeumadsTrail(request.slug); // use your function
    return articleTrail.map(
      (article) => {
        return `
        <!-- Your HTML here, replacing blogdetails with your fetched data -->

          <!-- Sample usage -->
          <div class="article">
            <h2>${article.title}</h2>
            <div class="category">${article.category}</div>
            <!-- Continue for all the properties you need -->
          </div>
        `;
      }
    );
  },
  after_render: () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  },
};

export default ArticleNeumadsTrailScreen;

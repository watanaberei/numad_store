// SeriesScreen.js
import { getArticleNeumadsTrail, getDineFeaturedBlog } from "../api.js";

import ArticleNeumadsTrail from "../components/ArticleNeumadsTrail.js";
import DineFeaturedBlog from "../components/DineFeaturedBlog.js";


const SeriesScreen = {
  render: async () => {
    const articleNeumadsTrails = await getArticleNeumadsTrail();
    const dineFeaturedBlogs = await getDineFeaturedBlog();
    

    console.log("getArticleNeumadsTrail:" + articleNeumadsTrails);
    console.log("getDineFeaturedBlog:" + dineFeaturedBlogs);

    return `<div>
    <div class="section-header container" id="section-header">
        <div class="dine-title">
            <span class="display03">
                Neumadic
            </span>
            <span class="display03">
                Neumadic
            </span>
        </div>
    </div>
    <div class="featured-blog-layout container" id="featured-blog-layout">
    ${articleNeumadsTrails ? articleNeumadsTrails.map((articleNeumadsTrail) => `${ArticleNeumadsTrail.render(articleNeumadsTrail)}`).join("\n") : ""}



    </div>
    <div class="section-header container" id="section-header">
        <div class="dine-title">
            <span class="display03">
                Dining Related Articles
            </span>
        </div>
    </div>
    <div class="blog-layout container" id="blog-layout">
    ${dineFeaturedBlogs.map((dineFeaturedBlog) => `${DineFeaturedBlog.render(dineFeaturedBlog)}`).join("\n")}
    </div>

    <div class="load-btn"><button class="load" id="load">Load more</button></div>
    </div>`;
  },
  after_render: () => {
    const btn = document.getElementById("load");
    let index = 0;
    btn.addEventListener("click", loadData);
  
    async function loadData() {
      const articleNeumadsTrails = await getArticleNeumadsTrail(3, 3 * ++index + 1);
      let template = document.getElementById("blog-layout");
      const data = articleNeumadsTrails
        .map(function (articleNeumadsTrail) {
          return ArticleNeumadsTrail.render(articleNeumadsTrail);
        })
        .join("\n");
      template.insertAdjacentHTML("beforeend", data);
      if (articleNeumadsTrails.length === 0) {
        btn.disabled = true;
        btn.innerText = "no more articleNeumadsTrails";
      }
    }
  },  
};

export default SeriesScreen;

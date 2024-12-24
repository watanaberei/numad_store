// src/Screen/WorkScreen.js
import { getWorkBlog, getWorkFeaturedBlog } from "../api.js";

import WorkBlog from "../components/WorkBlog.js";
import WorkFeaturedBlog from "../components/WorkFeaturedBlog.js";

const WorkScreen = {
  render: async () => {
    const workBlogs = await getWorkBlog();
    const workFeaturedBlogs = await getWorkFeaturedBlog();

    console.log("getWorkBlog:" + workBlogs);
    console.log("getWorkFeaturedBlog:" + workFeaturedBlogs);

    return `<div>
    <div class="section-header container" id="section-header">
        <div class="work-title">
            <span class="display03">
                Nomadic Work 
            </span>
        </div>
    </div>
    <div class="featured-blog-layout container" id="featured-blog-layout">
    ${workFeaturedBlogs.map((workFeaturedBlog) => `${WorkFeaturedBlog.render(workFeaturedBlog)}`).join("\n")}


    </div>
    <div class="section-header container" id="section-header">
        <div class="work-title">
            <span class="display03">
                Work Related Articles
            </span>
        </div>
    </div>
    <div class="blog-layout container" id="blog-layout">
      ${workBlogs.map((workBlog) => `${WorkBlog.render(workBlog)}`).join("\n")}
    </div>

    <div class="load-btn"><button class="load" id="load">Load more</button></div>
    </div>`;
  },
  after_render: () => {
    const btn = document.getElementById("load");
    let index = 0;
    btn.addEventListener("click", loadData);

    async function loadData() {
      const workBlogs = await getWorkBlogs(3, 3 * ++index + 1);
      let template = document.getElementById("blog-layout");
      const data = workBlogs
        .map(function (workBlog) {
          return WorkBlog.render(workBlog);
        })
        .join("\n");
      template.insertAdjacentHTML("beforeend", data);
      if (workBlogs.length === 0) {
        btn.disabled = true;
        btn.innerText = "no more workBlogs";
      }
    }
  },
};

export default WorkScreen;

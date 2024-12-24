// HomeScreen.js
import { getShortsBlog, getShortsFeaturedBlog } from "../api.js";

import ShortsBlog from "../components/ShortsBlog.js";
import ShortsFeaturedBlog from "../components/ShortsFeaturedBlog.js";

const ShortsScreen = {
  render: async () => {
    const shortsBlogs = await getShortsBlog();
    const shortsFeaturedBlogs = await getShortsFeaturedBlog();

    console.log("getShortsBlog:" + shortsBlogs);
    console.log("getShortsFeaturedBlog:" + shortsFeaturedBlogs);

    return `<div>
    <div class="section-header container" id="section-header">
        <div class="shorts-title">
            <span class="display03">
                Shorts Reads
            </span>
        </div>
    </div>
    <div class="featured-blog-layout container" id="featured-blog-layout">
    ${shortsFeaturedBlogs.map((shortsFeaturedBlog) => `${ShortsFeaturedBlog.render(shortsFeaturedBlog)}`).join("\n")}


    </div>
    <div class="section-header container" id="section-header">
        <div class="shorts-title">
            <span class="display03">
                All Article Shorts
            </span>
        </div>
    </div>
    <div class="blog-layout container" id="blog-layout">
      ${shortsBlogs.map((shortsBlog) => `${ShortsBlog.render(shortsBlog)}`).join("\n")}
    </div>

    <div class="load-btn"><button class="load" id="load">Load more</button></div>
    </div>`;
  },
  after_render: () => {
    const btn = document.getElementById("load");
    let index = 0;
    btn.addEventListener("click", loadData);

    async function loadData() {
      const shortsBlogs = await getShortsBlogs(3, 3 * ++index + 1);
      let template = document.getElementById("blog-layout");
      const data = shortsBlogs
        .map(function (shortsBlog) {
          return ShortsBlog.render(shortsBlog);
        })
        .join("\n");
      template.insertAdjacentHTML("beforeend", data);
      if (shortsBlogs.length === 0) {
        btn.disabled = true;
        btn.innerText = "no more shortsBlogs";
      }
    }
  },
};

export default ShortsScreen;

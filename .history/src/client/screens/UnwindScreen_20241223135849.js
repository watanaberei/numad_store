// UnwindScreen.js
import { getUnwindBlog, getUnwindFeaturedBlog } from "../api.js";

import UnwindBlog from "../components/UnwindBlog.js";
import UnwindFeaturedBlog from "../components/UnwindFeaturedBlog.js";

const UnwindScreen = {
  render: async () => {
    const unwindBlogs = await getUnwindBlog();
    const unwindFeaturedBlogs = await getUnwindFeaturedBlog();

    console.log("getUnwindBlog:" + unwindBlogs);
    console.log("getUnwindFeaturedBlog:" + unwindFeaturedBlogs);

    return `<div>
    <div class="section-header container" id="section-header">
        <div class="unwind-title">
            <span class="display03">
                Everything Unwinding
            </span>
        </div>
    </div>
    <div class="featured-blog-layout container" id="featured-blog-layout">
    ${unwindFeaturedBlogs.map((unwindFeaturedBlog) => `${UnwindFeaturedBlog.render(unwindFeaturedBlog)}`).join("\n")}


    </div>
    <div class="section-header container" id="section-header">
        <div class="unwind-title">
            <span class="display03">
                Articles Related to Unwinding
            </span>
        </div>
    </div>
    <div class="blog-layout container" id="blog-layout">
      ${unwindBlogs.map((unwindBlog) => `${UnwindBlog.render(unwindBlog)}`).join("\n")}
    </div>

    <div class="load-btn"><button class="load" id="load">Load more</button></div>
    </div>`;
  },
  after_render: () => {
    const btn = document.getElementById("load");
    let index = 0;
    btn.addEventListener("click", loadData);

    async function loadData() {
      const unwindBlogs = await getUnwindBlogs(3, 3 * ++index + 1);
      let template = document.getElementById("blog-layout");
      const data = unwindBlogs
        .map(function (unwindBlog) {
          return UnwindBlog.render(unwindBlog);
        })
        .join("\n");
      template.insertAdjacentHTML("beforeend", data);
      if (unwindBlogs.length === 0) {
        btn.disabled = true;
        btn.innerText = "no more unwindBlogs";
      }
    }
  },
};

export default UnwindScreen;

///////////////////////// START CARD BLOG COMPONENT /////////////////////////
// cardBlog.js - Blog card component for carousels
class CardBlog {
  constructor(blogData) {
      console.log('cardBlog.js:5 - CardBlog constructor called with:', blogData);
      this.blogData = blogData;
  }

  render() {
      console.log('cardBlog.js:10 - CardBlog render function called');
      return `
          <div class="card-blog" data-blog-id="${this.blogData.id}">
              <div class="blog-content">
                  <h3>${this.blogData.title}</h3>
                  <p>${this.blogData.excerpt}</p>
              </div>
          </div>
      `;
  }
}
///////////////////////// END CARD BLOG COMPONENT /////////////////////////
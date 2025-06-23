export const cardBlogUser = {
  render: (data) => `
    <div class="card-blog">
      <img src="${data.thumbnail}" />
      <h3>${data.title}</h3>
      <p>${data.snippet}</p>
    </div>
  `
};
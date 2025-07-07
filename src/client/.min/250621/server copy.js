import * as array from "../../components/array/arrayEffector.js";
import * as cardBlog from "../../components/cards/cardBlog.js";
import * as cardStore from "../../components/cards/cardStore.js";
import BlogData from '../../../data/neumad.Blog.json';
import UserData from '../../../data/neumad.User.json';

const ProfileScreen = {
  render: async () => {
    const user = UserData.find(u => u.username.toLowerCase() === 'neumad');
    if (!user) return `<div>User not found</div>`;

    const visited = user.visitHistory
      .sort((a, b) => new Date(b.timestamp.$date) - new Date(a.timestamp.$date))
      .map(e => e.storeId)
      .filter((id, i, arr) => arr.indexOf(id) === i);

    const blogs = BlogData
      .filter(b => b.author.username?.toLowerCase() === 'neumad')
      .sort((a, b) => new Date(b.publishedAt.$date) - new Date(a.publishedAt.$date))
      .slice(0, 5);

    const blogHTML = array.arrayCarousel(cardBlog.cardBlogUser).render(blogs, { limit: 5 });
    const storeHTML = array.arrayCarousel(cardStore).render(visited.map(id => ({ slug: id })), { limit: 4 });

    return `
      <div>
        <h2>Recently Viewed</h2>
        ${storeHTML}
        <h2>My Blog Posts</h2>
        ${blogHTML}
      </div>
    `;
  }
};
export default ProfileScreen;
const cardStore = {
  render: (data) => `
    <div class="card-store">
      <h3>${data.slug.replace(/_/g, ' ')}</h3>
    </div>
  `
};
export default cardStore;
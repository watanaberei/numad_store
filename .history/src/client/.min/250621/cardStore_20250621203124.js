///////////////////////// START CARD STORE COMPONENT /////////////////////////
// cardStore.js - Store card component for carousels
class CardStore {
  constructor(storeData) {
      console.log('cardStore.js:5 - CardStore constructor called with:', storeData);
      this.storeData = storeData;
  }

  render() {
      console.log('cardStore.js:10 - CardStore render function called');
      return `
          <div class="card-store" data-store-id="${this.storeData.id}">
              <div class="store-content">
                  <h3>${this.storeData.name}</h3>
                  <p>${this.storeData.location}</p>
              </div>
          </div>
      `;
  }
}
///////////////////////// END CARD STORE COMPONENT /////////////////////////
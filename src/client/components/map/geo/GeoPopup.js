import * as d3 from 'd3';

let selectedFeature = null;

export function geoPopup(feature, map) {
  // Store the selected feature
  selectedFeature = feature;

  // Get the map container
  const mapContainer = document.getElementById('map-container');

  // Remove the existing card if there is one
  const existingCard = mapContainer.querySelector('.geo-popup-card');
  if (existingCard) {
    mapContainer.removeChild(existingCard);
  }

  // Create a new div element for the card
  const card = document.createElement('div');
  card.className = 'geo-popup-card';

  // Create a new button element for the close button
  const closeButton = document.createElement('button');
  closeButton.className = 'geo-popup-close-button';
  closeButton.innerHTML = 'Close';
  closeButton.onclick = function() {
    card.style.display = 'none';

    // Remove the pressed state
    if (selectedFeature) {
      map.removeFeatureState({ source: selectedFeature.source, id: selectedFeature.id });
      selectedFeature = null;
    }
  };
  card.appendChild(closeButton);


  // Create a new div element for the card content
  const content = document.createElement('div');
  content.className = 'geo-popup-content';
  content.innerHTML = '<pre>' + JSON.stringify(feature.properties, null, 2) + '</pre>';
  card.appendChild(content);

  // Create a new div element for the SVG container
  const svgContainer = document.createElement('div');
  svgContainer.className = 'geo-popup-svg-container';
  svgContainer.style.width = '30%';
  svgContainer.style.margin = 'auto';
  card.appendChild(svgContainer);

  // Create an SVG element and render the vector shape
  const svg = d3.select(svgContainer).append('svg')
    .style('width', '100%')
    .style('height', 'auto')
    .attr('viewBox', '0 0 610 1340')
    .attr('preserveAspectRatio', 'inherit');
  const path = d3.geoPath();
  svg.append('path')
    .attr('d', path(feature.geometry))
    .attr('fill', 'none')
    .attr('stroke', 'black');

  // Append the card to the map container
  mapContainer.appendChild(card);
}
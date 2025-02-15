export const loaderStyle = `
.loading {
    /* background-color: red; */
}



.blog-img-loader {
    height: 9rem;
    background-color: var(--green02);
    /* height: 100%; */
}

.blog-title-text-loader {
    height: 1em;
    background-color: var(--green02);
}

`;



  // Apply hero styles to the document
  const loader = document.createElement('style');
  loader.textContent = loaderStyle;
  document.head.appendChild(loader);
  



const containerMass = 5;
const mouseMass = 10;

let imageHasLoaded = false;

let mouseX = 0;
let prevMouseX = 0;
let mouseXOnDown = null;
let isMouseDown = false;

let containerPosition = 0;
let mouseVelocity = 0;
let containerVelocity = 0;

let imagesElement = null;





const checkImagesHasLoaded = images => {
  const allImagePromises = images.map(image => {
    return new Promise(resolve => {
      const imageObj = new Image();
      imageObj.onload = () => {
        resolve(imageObj);
      };

      imageObj.src = image;
    });
  });

  return Promise.all(allImagePromises);
};

const createBeltScroller = (container, images) => {
  checkImagesHasLoaded(images).then(resolvedImages => {
    imageHasLoaded = true;
    const beltDOMItems = images.map((image, index) => {
      const element = document.createElement("div");
      element.classList.add("item");
      element.style.transform = `matrix(1, 0, 0, 1, 0, 0)`;
      element.style.height = `${36 *
        resolvedImages[index].naturalHeight /
        resolvedImages[index].naturalWidth}vw`;
      const elementImage = document.createElement("div");
      elementImage.style.backgroundImage = `url(${image})`;
      element.appendChild(elementImage);
      return element;
    });
    
    imagesElement = beltDOMItems.map(element => element);

    beltDOMItems.forEach(beltDOMItem => {
      container.appendChild(beltDOMItem);
    });
  });
};


export const generateMediaCarouselSmall = {
    render: (mediaArea, limit) => {
      let mediaGalleryHTML = '';
      mediaArea.slice(0, limit).forEach((mediaGalleryItem, index) => {
        const opacityClass = index >= 3 ? 'low-opacity' : '';
        const opacityPeakClass = index >= 3 ? 'low-opacity' : '';
        const opacityOuterClass = index >= 4 ? 'low-opacity' : '';
  
        checkImagesHasLoaded([mediaGalleryItem.url]).then(resolvedImages => {
          imageHasLoaded = true;
          const element = document.createElement("div");
          element.classList.add("item");
          element.style.transform = `matrix(1, 0, 0, 1, 0, 0)`;
          element.style.height = `${36 *
            resolvedImages[0].naturalHeight /
            resolvedImages[0].naturalWidth}vw`;
          const elementImage = document.createElement("div");
          elementImage.style.backgroundImage = `url(${mediaGalleryItem.url})`;
          element.appendChild(elementImage);
  
          imagesElement = [element];
  
          mediaGalleryHTML += `
          <div class="media-img-s ${opacityClass}">
            <div class="media-img-container-s">
              ${element.outerHTML}
            </div>
            <div class="caption-default">
              <div class="caption-container">
                <div class="glyph-inline">
                  <div class="glyph-inline-12">
                    <div class="glyph-text">
                      <div class="ellipse-328"></div>
                    </div>
                  </div>
                </div>
                <div class="text-line">
                  <div class="text-line-12">
                    <div class="title">
                      <span class="text03 bold">
                        ${mediaGalleryItem.description}
                      </span>
                    </div>                   
                  </div>
                </div>
              </div>
            </div>
          </div>`;
        });
      });
      return mediaGalleryHTML;
    }
  };


const container = document.querySelector(".container");

// generateMediaCarouselSmall(mediaArea.url || [], 9);

const onMouseUpdate = event => {
  mouseX = event.pageX;
};

const onMouseDown = () => {
  isMouseDown = true;
};

const onMouseUp = () => {
  isMouseDown = false;
};

document.addEventListener("mousemove", onMouseUpdate, false);

document.addEventListener("mousedown", onMouseDown);

document.addEventListener("mouseup", onMouseUp);

const calculateMouseMomentum = () => {
  if (isMouseDown) {
    if (mouseXOnDown == null) {
      mouseXOnDown = mouseX;
      containerVelocity = 0;
    }

    const distance = mouseX - mouseXOnDown;

    mouseVelocity = mouseX - prevMouseX;
  } else {
    if (mouseXOnDown != null) {
      containerVelocity =
        2 * mouseMass / (mouseMass + containerMass) * mouseVelocity +
        (containerMass - mouseMass) /
          (mouseMass + containerMass) *
          containerVelocity;

      const maxVelocity = 60;

      if (containerVelocity > maxVelocity) {
        containerVelocity = maxVelocity;
      } else if (containerVelocity < -maxVelocity) {
        containerVelocity = -maxVelocity;
      }

      mouseXOnDown = null;
      mouseVelocity = 0;
    }
  }

  prevMouseX = mouseX;
};

const updateContainer = () => {
  const boundRight = -container.offsetWidth + window.innerWidth - 85;

  const isOutBound = containerPosition > 0 || containerPosition < boundRight;

  if (!isMouseDown) {
    const mu = 0.04;
    const g = 10;
    const flictionForce = containerMass * g * mu;
    const flictionA = flictionForce / containerMass;

    if (containerVelocity > 0) {
      containerVelocity -= flictionA;
      if (containerVelocity < 0) {
        containerVelocity = 0;
      }
    } else if (containerVelocity < 0) {
      containerVelocity += flictionA;
      if (containerVelocity > 0) {
        containerVelocity = 0;
      }
    }

    if (isOutBound) {
      const k = 0.01;
      const restLength = containerPosition > 0 ? 0 : boundRight;
      const currentLength = containerPosition;
      const dragForce = 1 * k * (restLength - currentLength);

      const dragForceA = dragForce / containerMass;
      containerVelocity += dragForce;

      const nextPosition = containerPosition + containerVelocity;

      if (containerPosition < boundRight && nextPosition > boundRight) {
        containerVelocity = 0;
        containerPosition = boundRight;
      } else if (containerPosition > 0 && nextPosition < 0) {
        containerVelocity = 0;
        containerPosition = 0;
      }
    }
  }

  containerPosition =
    containerPosition +
    containerVelocity +
    (isOutBound ? mouseVelocity / 2 : mouseVelocity);
  
  container.style.transform = `translate(${containerPosition}px)`;
};

const addOpacityWhenImageInBound = () => {
  if(!imagesElement) {
    return
  }

  imagesElement.forEach((imageElement, index) => {
    const { left, right, width } = imageElement.children[0].getBoundingClientRect();
    if(index === 0) {
      console.log('left', left, width); 
    }
    if (left <= -width || right >= window.innerWidth/1.5 + width) {
      if(imageElement.classList.contains('show')) {
        imageElement.classList.remove('show');
      } 
    } else {
      if(!imageElement.classList.contains('show')) {
        imageElement.classList.add('show');
      }
    }
  });
};

const loop = () => {
  if (imageHasLoaded) {
    addOpacityWhenImageInBound();
    calculateMouseMomentum();
    updateContainer();
  }
  window.requestAnimationFrame(() => {
    loop();
  });
};

loop();
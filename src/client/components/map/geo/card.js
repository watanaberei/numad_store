export const tagType = {
    render: (storeTitle) => {
            return `
            <div class="header">
                <div class="title">
                    <span class="text">
                        <span class="text-03 bold">${storeTitle.title}</span>
                        <span class="location text-03 bold">in ${storeTitle.location}</span>
                    </span>
                </div>
            </div>
        `;
    },
  };



  export const eyebrow = {
    render: (storeEyebrow, storeRange) => {
        return `
        <div class="eyebrow">
            <div class="status-tag-item">
                <div class="metatag">
                <div class="metatag-label">
                    <div class="rate">
                        <div class="component-75">
                            <div class="ellipse-289"></div>
                        </div>
                    </div>
                    <div class="closed-until-8-am">
                        ${storeEyebrow}
                        <!--
                            Closed until 8am
                        -->
                    </div>
                </div>
                </div>
            </div>
            <div class="miles">
                <div class="geo-tag">
                <div class="label">
                    <div class="_0">${storeRange}</div>
                    <div class="mi">mi away</div>
                </div>
                <div class="glyph-map-pin-upper-12-px-18">
                    <svg
                    class="glyph-map-pin-upper"
                    width="7"
                    height="9"
                    viewBox="0 0 7 9"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    >
                    <mask id="path-1-inside-1_229_14246" fill="white">
                        <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M6.16406 3.11719C6.16406 3.55967 6.06349 3.97866 5.88395 4.35255L3.96553 8.76733H2.74442L0.765236 4.42468C0.563256 4.03288 0.449219 3.58835 0.449219 3.11719C0.449219 1.53908 1.72853 0.259766 3.30664 0.259766C4.88475 0.259766 6.16406 1.53908 6.16406 3.11719Z"
                        />
                    </mask>
                    <path
                        d="M5.88395 4.35255L4.39655 3.63831L4.38306 3.66639L4.37065 3.69496L5.88395 4.35255ZM3.96553 8.76733V10.4173H5.04759L5.47883 9.42493L3.96553 8.76733ZM2.74442 8.76733L1.24299 9.45161L1.68313 10.4173H2.74442V8.76733ZM0.765236 4.42468L2.26666 3.74041L2.25011 3.7041L2.23183 3.66863L0.765236 4.42468ZM7.37135 5.06679C7.65562 4.4748 7.81406 3.81218 7.81406 3.11719H4.51406C4.51406 3.30717 4.47135 3.48253 4.39655 3.63831L7.37135 5.06679ZM5.47883 9.42493L7.39724 5.01015L4.37065 3.69496L2.45223 8.10974L5.47883 9.42493ZM2.74442 10.4173H3.96553V7.11733H2.74442V10.4173ZM-0.736184 5.10896L1.24299 9.45161L4.24584 8.08306L2.26666 3.74041L-0.736184 5.10896ZM-1.20078 3.11719C-1.20078 3.85749 -1.02103 4.56062 -0.701353 5.18074L2.23183 3.66863C2.14754 3.50514 2.09922 3.31922 2.09922 3.11719H-1.20078ZM3.30664 -1.39023C0.81726 -1.39023 -1.20078 0.627807 -1.20078 3.11719H2.09922C2.09922 2.45035 2.6398 1.90977 3.30664 1.90977V-1.39023ZM7.81406 3.11719C7.81406 0.627807 5.79602 -1.39023 3.30664 -1.39023V1.90977C3.97348 1.90977 4.51406 2.45035 4.51406 3.11719H7.81406Z"
                        fill="#373A42"
                        mask="url(#path-1-inside-1_229_14246)"
                    />
                    </svg>
                </div>
                </div>
            </div>
        </div>`;
    },
  };

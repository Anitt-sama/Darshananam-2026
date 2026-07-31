import "./style.css";
import { PageFlip } from "page-flip";

const TOTAL_PAGES = 60;

let pageFlip;
let currentZoom = 1;

const app = document.querySelector("#app");

/* ---------------------------------------------------
   BUILD APPLICATION
--------------------------------------------------- */

app.innerHTML = `
<div id="viewer">

    <header id="toolbar">

        <div class="toolbar-left">

            <button id="firstBtn" title="First Page">
                ⏮
            </button>

            <button id="prevBtn" title="Previous Page">
                ◀
            </button>

        </div>

        <div class="toolbar-center">

            <span id="pageIndicator">
                1 / ${TOTAL_PAGES}
            </span>

        </div>

        <div class="toolbar-right">

            <button id="zoomOut" title="Zoom Out">
                −
            </button>

            <button id="zoomIn" title="Zoom In">
                +
            </button>

            <button id="fullscreenBtn" title="Fullscreen">
                ⛶
            </button>

            <button id="nextBtn" title="Next Page">
                ▶
            </button>

            <button id="lastBtn" title="Last Page">
                ⏭
            </button>

        </div>

    </header>

   <main id="bookWrapper">
    <div id="zoomWrapper">
        <div id="flipbook"></div>
    </div>
</main>

</div>
`;

const flipbook = document.getElementById("flipbook");
const zoomWrapper = document.getElementById("zoomWrapper");
const indicator = document.getElementById("pageIndicator");

function getBookSize() {

    const w = window.innerWidth;
    const h = window.innerHeight;

    if (w < 768) {

        return {

            width: Math.min(w * 0.95, 500),
            height: Math.min(h * 0.85, 750),
            mobile: true

        };

    }

    /* Increased size proportions so it is no longer too small at 100% zoom */
    return {

        width: Math.min(w * 0.75, 1100),
        height: Math.min(h * 0.90, 1100),
        mobile: false

    };

}

function createPages() {

    const pages = [];

    for (let i = 1; i <= TOTAL_PAGES; i++) {

        const page = document.createElement("div");

        page.className = "page";

        page.style.background = "transparent";
        page.style.border = "none";
        page.style.boxShadow = "none";
        page.style.overflow = "hidden";
        
        const image = document.createElement("img");

        image.decoding = "async";

        if (i <= 4) {
            image.loading = "eager";
            image.fetchPriority = "high";
        } else {
            image.loading = "lazy";
        }

        image.style.width = "100%";
        image.style.height = "100%";
        image.style.objectFit = "contain";
        image.style.display = "block";

        image.draggable = false;

        image.src = `/pages/page${String(i).padStart(3, "0")}.jpg`;

        image.alt = `Page ${i}`;

        page.appendChild(image);

        pages.push(page);

    }

    return pages;

}

function initializeBook() {

    const size = getBookSize();

    flipbook.innerHTML = "";

    pageFlip = new PageFlip(flipbook, {

        width: size.width,

        height: size.height,

        minWidth: 300,

        maxWidth: 1200,

        minHeight: 400,

        maxHeight: 1400,

        size: "stretch",

        maxShadowOpacity: 0.45,

        showCover: true,

        mobileScrollSupport: true,

        usePortrait: size.mobile,

        autoSize: true,

        startPage: 0,

        clickEventForward: true,

        flippingTime: 650,

        drawShadow: true,

        showPageCorners: true

    });

    pageFlip.loadFromHTML(createPages());

}

/* ---------------------------------------------------
   PAGE EVENTS
--------------------------------------------------- */

function updatePageIndicator() {

    if (!pageFlip) return;

    const current = pageFlip.getCurrentPageIndex() + 1;

    indicator.textContent = `${current} / ${TOTAL_PAGES}`;

}

function nextPage() {

    if (pageFlip)
        pageFlip.flipNext();

}

function previousPage() {

    if (pageFlip)
        pageFlip.flipPrev();

}

function firstPage() {

    if (pageFlip)
        pageFlip.turnToPage(0);

}

function lastPage() {

    if (pageFlip)
        pageFlip.turnToPage(TOTAL_PAGES - 1);

}

/* ---------------------------------------------------
   TOOLBAR
--------------------------------------------------- */

document
    .getElementById("nextBtn")
    .addEventListener("click", nextPage);

document
    .getElementById("prevBtn")
    .addEventListener("click", previousPage);

document
    .getElementById("firstBtn")
    .addEventListener("click", firstPage);

document
    .getElementById("lastBtn")
    .addEventListener("click", lastPage);

/* ---------------------------------------------------
   MOUSE WHEEL
--------------------------------------------------- */

let wheelTimeout;

flipbook.addEventListener("wheel", (event) => {

    event.preventDefault();

    clearTimeout(wheelTimeout);

    wheelTimeout = setTimeout(() => {

        if (event.deltaY > 0)
            pageFlip.flipNext();
        else
            pageFlip.flipPrev();

    }, 180);

}, { passive: false });

/* ---------------------------------------------------
   ZOOM
--------------------------------------------------- */

function applyZoom() {
    zoomWrapper.style.transform = `scale(${currentZoom})`;
    zoomWrapper.style.transformOrigin = "center center";
}

document
    .getElementById("zoomIn")
    .addEventListener("click", () => {
        currentZoom = Math.min(currentZoom + 0.15, 2.5);
        applyZoom();
    });

document
    .getElementById("zoomOut")
    .addEventListener("click", () => {
        currentZoom = Math.max(currentZoom - 0.15, 0.6);
        applyZoom();
    });

/* ---------------------------------------------------
   FULLSCREEN
--------------------------------------------------- */

document
    .getElementById("fullscreenBtn")
    .addEventListener("click", async () => {

        const viewer = document.getElementById("viewer");

        try {

            if (!document.fullscreenElement) {

                await viewer.requestFullscreen();

            } else {

                await document.exitFullscreen();

            }

        } catch (error) {

            console.error("Fullscreen failed:", error);

        }

    });

/* ---------------------------------------------------
   PAGEFLIP EVENTS
--------------------------------------------------- */

function registerEvents() {

    pageFlip.on("init", () => {

        updatePageIndicator();

        hideLoader();

    });

    pageFlip.on("flip", () => {

        updatePageIndicator();

    });

    pageFlip.on("changeOrientation", () => {

        updatePageIndicator();

    });

}

/* ---------------------------------------------------
   RESPONSIVE RESIZE
--------------------------------------------------- */

let resizeTimer;

window.addEventListener("resize", () => {

    clearTimeout(resizeTimer);

    resizeTimer = setTimeout(() => {

        if (!pageFlip) return;

        const currentPage = pageFlip.getCurrentPageIndex();
        const savedZoom = currentZoom;

        pageFlip.destroy();

        initializeBook();

        registerEvents();

        pageFlip.turnToPage(currentPage);

        currentZoom = savedZoom;

        setTimeout(() => {
            updatePageIndicator();
        }, 50);

        applyZoom();

    }, 300);

});

/* ---------------------------------------------------
   IMAGE PROTECTION
--------------------------------------------------- */

document.addEventListener("dragstart", (event) => {

    event.preventDefault();

});

document.addEventListener("contextmenu", (event) => {

    if (event.target.tagName === "IMG") {

        event.preventDefault();

    }

});

/* ---------------------------------------------------
   CTRL + WHEEL ZOOM
--------------------------------------------------- */

window.addEventListener("wheel", (event) => {

    if (!event.ctrlKey)
        return;

    event.preventDefault();

    if (event.deltaY < 0)
        currentZoom += 0.05;
    else
        currentZoom -= 0.05;

    currentZoom = Math.max(0.6, Math.min(currentZoom, 2.5));

    applyZoom();

}, { passive: false });

/* ---------------------------------------------------
   EXTRA SHORTCUTS
--------------------------------------------------- */

document.addEventListener("keydown", (event) => {

    if (!pageFlip) return;

    switch (event.key) {

        case "ArrowRight":
            pageFlip.flipNext();
            break;

        case "ArrowLeft":
            pageFlip.flipPrev();
            break;

        case "Home":
            pageFlip.turnToPage(0);
            break;

        case "End":
            pageFlip.turnToPage(TOTAL_PAGES - 1);
            break;

        case "+":
        case "=":
            currentZoom = Math.min(currentZoom + 0.15, 2.5);
            applyZoom();
            break;

        case "-":
            currentZoom = Math.max(currentZoom - 0.15, 0.6);
            applyZoom();
            break;

        case "f":
        case "F":
            document.getElementById("fullscreenBtn").click();
            break;

    }

});

/* ---------------------------------------------------
   LOADING
--------------------------------------------------- */

function showLoader() {

    flipbook.classList.add("loading");

}

function hideLoader() {

    flipbook.classList.remove("loading");

}

/* ---------------------------------------------------
   APPLICATION START
--------------------------------------------------- */

showLoader();

initializeBook();

registerEvents();

updatePageIndicator();

applyZoom();

hideLoader();
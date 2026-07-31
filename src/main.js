import "./style.css";
import { PageFlip } from "page-flip";

const TOTAL_PAGES = 60;

let pageFlip;
let currentZoom = 1;

// Fallback aspect ratio (width/height) used only until the real first-page
// image loads and tells us its actual dimensions.
let pageAspectRatio = 0.78;

const app = document.querySelector("#app");

/* ---------------------------------------------------
   HOTSPOTS & HYPERLINKS CONFIGURATION
--------------------------------------------------- */
const pageHotspots = {
    // Table of Contents (Page 3) - Page 2 link completely removed
    3: [
        { type: "internal", targetPage: 4,  top: "20%", left: "8.2%", width: "81.8%", height: "1.6%" }, // Chief Editorial
  { type: "internal", targetPage: 5,  top: "24.25%", left: "8.2%", width: "81.8%", height: "1.6%" }, // Vicar's Message
  { type: "internal", targetPage: 6,  top: "28.25%", left: "8.2%", width: "81.8%", height: "1.6%" }, // Other Messages
  { type: "internal", targetPage: 10, top: "33%", left: "8.2%", width: "81.8%", height: "1.6%" }, // Theme Feature
  { type: "internal", targetPage: 14, top: "37.25.0%", left: "8.2%", width: "81.8%", height: "1.6%" }, // Doctor's Message
  { type: "internal", targetPage: 19, top: "41.5%", left: "8.2%", width: "81.8%", height: "1.6%" }, // Creative and Fun Zone
  { type: "internal", targetPage: 18, top: "45.75%", left: "8.2%", width: "81.8%", height: "1.6%" }, // Biblical Story
  { type: "internal", targetPage: 22, top: "49%", left: "8.2%", width: "81.8%", height: "1.6%" }, // Meet the Saint
  { type: "internal", targetPage: 24, top: "53.25%", left: "8.2%", width: "81.8%", height: "1.6%" }, // Articles and Games
  { type: "internal", targetPage: 38, top: "57.5%", left: "8.2%", width: "81.8%", height: "1.6%" }, // Darshanam Quest
  { type: "internal", targetPage: 52, top: "61.75%", left: "8.2%", width: "81.8%", height: "1.6%" }, // Drawings and Posters
  { type: "internal", targetPage: 58, top: "65%", left: "8.2%", width: "81.8%", height: "1.6%" }  // Gallery
    ],

    // QR Code Pages
    17: [{ type: "external", url: "https://example.com/qr-17", top: "35%", left: "35%", width: "30%", height: "30%" }],
    27: [{ type: "external", url: "https://example.com/qr-27", top: "35%", left: "35%", width: "30%", height: "30%" }],
    30: [{ type: "external", url: "https://example.com/qr-30", top: "35%", left: "35%", width: "30%", height: "30%" }],
    46: [{ type: "external", url: "https://example.com/qr-46", top: "35%", left: "35%", width: "30%", height: "30%" }],
    47: [{ type: "external", url: "https://example.com/qr-47", top: "35%", left: "35%", width: "30%", height: "30%" }],
    51: [{ type: "external", url: "https://example.com/qr-51", top: "35%", left: "35%", width: "30%", height: "30%" }],
    54: [{ type: "external", url: "https://example.com/qr-54", top: "35%", left: "35%", width: "30%", height: "30%" }],
    57: [{ type: "external", url: "https://example.com/qr-57", top: "35%", left: "35%", width: "30%", height: "30%" }],

    // Social Media Links on Page 60
    60: [
        { type: "external", url: "https://facebook.com/yourpage", top: "45%", left: "25%", width: "15%", height: "10%" },
        { type: "external", url: "https://instagram.com/yourpage", top: "45%", left: "42%", width: "15%", height: "10%" },
        { type: "external", url: "https://youtube.com/yourpage", top: "45%", left: "60%", width: "15%", height: "10%" }
    ]
};

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

            <button id="zoomOut">
                −
            </button>

            <button id="zoomIn">
                +
            </button>

            <button id="fullscreenBtn">
                ⛶
            </button>

            <button id="nextBtn">
                ▶
            </button>

            <button id="lastBtn">
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

function loadPageAspectRatio() {

    return new Promise((resolve) => {

        const probe = new Image();

        probe.onload = () => {

            if (probe.naturalWidth && probe.naturalHeight) {
                pageAspectRatio = probe.naturalWidth / probe.naturalHeight;
            }

            resolve();

        };

        probe.onerror = () => resolve();

        probe.src = "/pages/page001.jpg";

    });

}

function getBookSize() {

    const w = window.innerWidth;
    const h = window.innerHeight;

    const mobile = w < 900;

    const maxPageWidth = mobile
        ? Math.min(w * 0.92, 450)
        : Math.min(w * 0.55, 850);

    const maxPageHeight = mobile
        ? Math.min(h * 0.82, 700)
        : Math.min(h * 0.90, 950);

    let width = maxPageWidth;
    let height = width / pageAspectRatio;

    if (height > maxPageHeight) {
        height = maxPageHeight;
        width = height * pageAspectRatio;
    }

    return { width, height, mobile };

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
        image.style.objectFit = "cover";
        image.style.display = "block";
        image.draggable = false;
        image.src = `/pages/page${String(i).padStart(3, "0")}.jpg`;
        image.alt = `Page ${i}`;

        page.appendChild(image);

        if (pageHotspots[i]) {
            const overlay = document.createElement("div");
            overlay.className = "page-overlay";

            pageHotspots[i].forEach(spot => {
                const hotspotEl = document.createElement("div");
                hotspotEl.className = "hotspot";
                hotspotEl.style.top = spot.top;
                hotspotEl.style.left = spot.left;
                hotspotEl.style.width = spot.width;
                hotspotEl.style.height = spot.height;

                if (spot.type === "internal") {
                    hotspotEl.title = `Go to page ${spot.targetPage}`;
                    hotspotEl.addEventListener("click", (e) => {
                        e.stopPropagation();
                        if (pageFlip) {
                            pageFlip.turnToPage(spot.targetPage - 3);
                        }
                    });
                } else if (spot.type === "external") {
                    hotspotEl.title = spot.url;
                    hotspotEl.addEventListener("click", (e) => {
                        e.stopPropagation();
                        window.open(spot.url, "_blank", "noopener,noreferrer");
                    });
                }

                overlay.appendChild(hotspotEl);
            });

            page.appendChild(overlay);
        }

        pages.push(page);

    }

    return pages;

}

function initializeBook() {

    const size = getBookSize();
    const totalWidth = size.mobile ? size.width : size.width * 2;

    zoomWrapper.style.width = `${totalWidth}px`;
    zoomWrapper.style.height = `${size.height}px`;

    if (!flipbook.isConnected) {
        zoomWrapper.appendChild(flipbook);
    }

    flipbook.innerHTML = "";

    pageFlip = new PageFlip(flipbook, {

        width: size.width,
        height: size.height,
        minWidth: 250,
        maxWidth: 900,
        minHeight: 350,
        maxHeight: 1200,
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

function updatePageIndicator() {

    if (!pageFlip) return;
    const current = pageFlip.getCurrentPageIndex() + 1;
    indicator.textContent = `${current} / ${TOTAL_PAGES}`;

}

function nextPage() {
    if (pageFlip) pageFlip.flipNext();
}

function previousPage() {
    if (pageFlip) pageFlip.flipPrev();
}

function firstPage() {
    if (pageFlip) pageFlip.turnToPage(0);
}

function lastPage() {
    if (pageFlip) pageFlip.turnToPage(TOTAL_PAGES - 1);
}

document.getElementById("nextBtn").addEventListener("click", nextPage);
document.getElementById("prevBtn").addEventListener("click", previousPage);
document.getElementById("firstBtn").addEventListener("click", firstPage);
document.getElementById("lastBtn").addEventListener("click", lastPage);

let wheelTimeout;

flipbook.addEventListener("wheel", (event) => {

    if (event.ctrlKey) return;
    event.preventDefault();
    clearTimeout(wheelTimeout);

    wheelTimeout = setTimeout(() => {
        if (event.deltaY > 0) pageFlip.flipNext();
        else pageFlip.flipPrev();
    }, 180);

}, { passive: false });

function applyZoom() {
    zoomWrapper.style.transform = `scale(${currentZoom})`;
    zoomWrapper.style.transformOrigin = "center center";
}

document.getElementById("zoomIn").addEventListener("click", () => {
    currentZoom = Math.min(currentZoom + 0.1, 2);
    applyZoom();
});

document.getElementById("zoomOut").addEventListener("click", () => {
    currentZoom = Math.max(currentZoom - 0.1, 0.6);
    applyZoom();
});

document.getElementById("fullscreenBtn").addEventListener("click", async () => {
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

let resizeTimer;

function rebuildBook() {

    if (!pageFlip) return;
    const currentPage = pageFlip.getCurrentPageIndex();
    pageFlip.destroy();
    initializeBook();
    registerEvents();
    pageFlip.turnToPage(currentPage);
    updatePageIndicator();
    applyZoom();

}

window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(rebuildBook, 300);
});

document.addEventListener("fullscreenchange", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(rebuildBook, 300);
});

document.addEventListener("dragstart", (event) => {
    event.preventDefault();
});

document.addEventListener("contextmenu", (event) => {
    if (event.target.tagName === "IMG") {
        event.preventDefault();
    }
});

window.addEventListener("wheel", (event) => {

    if (!event.ctrlKey) return;
    event.preventDefault();

    if (event.deltaY < 0) currentZoom += 0.05;
    else currentZoom -= 0.05;

    currentZoom = Math.max(0.6, Math.min(currentZoom, 2));
    applyZoom();

}, { passive: false });

document.addEventListener("keydown", (event) => {

    if (!pageFlip) return;

    switch (event.key) {
        case "ArrowRight": pageFlip.flipNext(); break;
        case "ArrowLeft": pageFlip.flipPrev(); break;
        case "Home": pageFlip.turnToPage(0); break;
        case "End": pageFlip.turnToPage(TOTAL_PAGES - 1); break;
        case "+": currentZoom = Math.min(currentZoom + 0.1, 2); applyZoom(); break;
        case "-": currentZoom = Math.max(currentZoom - 0.1, 0.6); applyZoom(); break;
        case "f":
        case "F": document.getElementById("fullscreenBtn").click(); break;
    }

});

function showLoader() {
    flipbook.classList.add("loading");
}

function hideLoader() {
    flipbook.classList.remove("loading");
}

showLoader();

loadPageAspectRatio().then(() => {
    initializeBook();
    registerEvents();
    updatePageIndicator();
    applyZoom();
});
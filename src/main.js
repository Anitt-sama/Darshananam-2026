import "./style.css";
import { PageFlip } from "page-flip";

const TOTAL_PAGES = 60;
const BASE = import.meta.env.BASE_URL;
let pageFlip;

const app = document.querySelector("#app");

/* ---------------------------------------------------
   HOTSPOTS & HYPERLINKS CONFIGURATION
--------------------------------------------------- */
const pageHotspots = {
    // Table of Contents (Page 3) - Page 2 link completely removed
    3: [
        { type: "internal", targetPage: 4,  top: "20%", left: "8.2%", width: "81.8%", height: "1.6%" },
        { type: "internal", targetPage: 5,  top: "24.25%", left: "8.2%", width: "81.8%", height: "1.6%" },
        { type: "internal", targetPage: 6,  top: "28.25%", left: "8.2%", width: "81.8%", height: "1.6%" },
        { type: "internal", targetPage: 10, top: "33%", left: "8.2%", width: "81.8%", height: "1.6%" },
        { type: "internal", targetPage: 14, top: "37.25%", left: "8.2%", width: "81.8%", height: "1.6%" },
        { type: "internal", targetPage: 16, top: "41.5%", left: "8.2%", width: "81.8%", height: "1.6%" },
        { type: "internal", targetPage: 18, top: "45.75%", left: "8.2%", width: "81.8%", height: "1.6%" },
        { type: "internal", targetPage: 22, top: "50%", left: "8.2%", width: "81.8%", height: "1.6%" },
        { type: "internal", targetPage: 24, top: "54.25%", left: "8.2%", width: "81.8%", height: "1.6%" },
        { type: "internal", targetPage: 51, top: "58.5%", left: "8.2%", width: "81.8%", height: "1.6%" },
        { type: "internal", targetPage: 52, top: "62.75%", left: "8.2%", width: "81.8%", height: "1.6%" },
        { type: "internal", targetPage: 58, top: "67%", left: "8.2%", width: "81.8%", height: "1.6%" }
    ],

    // QR Code Pages
    17: [{ type: "external", url: "https://break-the-chain-d3be42.netlify.app/", top: "38.93%", left: "24.51%", width: "17.69%", height: "12.98%" }],
    27: [{ type: "external", url: "https://time-echoes-c999c0.netlify.app/", top: "75.46%", left: "77.45%", width: "14.56%", height: "12.49%" }],
    30: [{ type: "external", url: "https://operation-phoenix-d075b1.netlify.app/", top: "43.49%", left: "24.21%", width: "46.10%", height: "32.21%" }],
    46: [{ type: "external", url: "https://jeevitham-f010db.netlify.app/", top: "18.03%", left: "41.68%", width: "23.39%", height: "18.23%" }],
    47: [{ type: "external", url: "https://escape-room-fa8729.netlify.app/", top: "72.09%", left: "19.93%", width: "29.22%", height: "21.05%" }],
    51: [{ type: "external", url: "https://darshanam-quest-b9da1f.netlify.app/", top: "70%", left: "8.48%", width: "32.21%", height: "22.21%" }],
    54: [{ type: "external", url: "https://long-path-af200e.netlify.app/", top: "77.76%", left: "53.81%", width: "26.25%", height: "18.47%" }],
    57: [{ type: "external", url: "https://docs.google.com/forms/d/e/1FAIpQLScadD7Rq9yifgufrYxX5SmU8jamZox6BazNo6cYxkwbDor4vw/viewform?usp=dialog", top: "47.62%", left: "48.60%", width: "13.84%", height: "9.76%" }],

    // Social Media Links on Page 60
    60: [
        { type: "external", url: "https://www.facebook.com/Karattukunnel", top: "96.15%", left: "2.20%", width: "26.80%", height: "2.85%" },
        { type: "external", url: "https://www.instagram.com/Karattukunnel_palli", top: "93.35%", left: "2.20%", width: "26.80%", height: "2.85%" }
    ],
};

/* ---------------------------------------------------
   BUILD APPLICATION
--------------------------------------------------- */

app.innerHTML = `
<div id="viewer">
    <header id="toolbar">
        <div class="toolbar-left">
            <button id="firstBtn" title="First Page">⏮</button>
            <button id="prevBtn" title="Previous Page">◀</button>
        </div>
        <div class="toolbar-center">
            <span id="pageIndicator">1 / ${TOTAL_PAGES}</span>
        </div>
        <div class="toolbar-right">
            <button id="zoomOut">−</button>
            <button id="zoomIn">+</button>
            <button id="fullscreenBtn">⛶</button>
            <button id="nextBtn">▶</button>
            <button id="lastBtn">⏭</button>
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

let pageAspectRatio = 0.78;

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
        probe.src = `${BASE}pages/page001.jpg`;
    });
}

function getBookSize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const mobile = w < 900;

    const maxPageWidth = mobile ? Math.min(w * 0.92, 450) : Math.min(w * 0.55, 850);
    const maxPageHeight = mobile ? Math.min(h * 0.82, 700) : Math.min(h * 0.90, 950);

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
        image.src = `${BASE}pages/page${String(i).padStart(3, "0")}.jpg`;
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
                            pageFlip.turnToPage(spot.targetPage - 3); // Based on your offset mapping
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
        useMouseEvents: false,     // MUST be false to disable default tap-to-flip[cite: 5]
        mobileScrollSupport: false, 
        usePortrait: size.mobile,
        autoSize: true,
        startPage: 0,
        flippingTime: 500,
        drawShadow: true,
        showPageCorners: true
    });

    pageFlip.loadFromHTML(createPages());
}

/* ---------------------------------------------------
   GESTURES: PINCH, PAN & SWIPE
--------------------------------------------------- */
let currentZoom = 1;
let isDragging = false;
let startX = 0, startY = 0;
let translateX = 0, translateY = 0;
let swipeStartX = 0, swipeStartY = 0, swipeStartTime = 0;

let activeTouches = 0;
let initialPinchDistance = null;
let initialZoom = 1;

function applyZoom(smooth = true) {
    // Reset to defaults if returning to base zoom
    if (currentZoom <= 1) {
        currentZoom = 1;
        translateX = 0;
        translateY = 0;
    }
    // Dynamic transition: smooth for clicks/wheel, disabled for real-time dragging
    zoomWrapper.style.transition = smooth ? "transform 0.25s ease" : "none";
    zoomWrapper.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom})`;
    zoomWrapper.style.transformOrigin = "center center";
}

const wrapper = document.getElementById("bookWrapper");

// Touch Interface (Mobile Swipes & Pinch Zoom)
wrapper.addEventListener('touchstart', (e) => {
    activeTouches = e.touches.length;
    if (activeTouches === 2) {
        e.preventDefault();
        initialPinchDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        initialZoom = currentZoom;
        isDragging = false;
    } else if (activeTouches === 1) {
        if (currentZoom > 1) {
            isDragging = true;
            startX = e.touches[0].clientX - translateX;
            startY = e.touches[0].clientY - translateY;
        } else {
            swipeStartX = e.touches[0].clientX;
            swipeStartY = e.touches[0].clientY;
            swipeStartTime = Date.now();
        }
    }
}, { passive: false });

wrapper.addEventListener('touchmove', (e) => {
    if (activeTouches === 2) {
        e.preventDefault();
        const currentDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        const zoomFactor = currentDistance / initialPinchDistance;
        currentZoom = Math.min(Math.max(initialZoom * zoomFactor, 1), 3);
        applyZoom(false); 
    } else if (activeTouches === 1) {
        if (currentZoom > 1 && isDragging) {
            e.preventDefault();
            translateX = e.touches[0].clientX - startX;
            translateY = e.touches[0].clientY - startY;
            applyZoom(false);
        } else if (currentZoom === 1) {
            const dx = e.touches[0].clientX - swipeStartX;
            const dy = e.touches[0].clientY - swipeStartY;
            if (Math.abs(dx) > Math.abs(dy)) {
                e.preventDefault(); // Stop native browser horizontal navigation
            }
        }
    }
}, { passive: false });

wrapper.addEventListener('touchend', (e) => {
    if (activeTouches === 2) {
        initialPinchDistance = null;
    } else if (activeTouches === 1 && currentZoom === 1) {
        const dx = e.changedTouches[0].clientX - swipeStartX;
        const dy = e.changedTouches[0].clientY - swipeStartY;
        const dt = Date.now() - swipeStartTime;

        // Turn page if it is a genuine fast horizontal swipe
        if (dt < 500 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
            if (dx < 0) pageFlip.flipNext();
            else pageFlip.flipPrev();
        }
    }
    isDragging = false;
    activeTouches = e.touches.length;
});

// Mouse Interface (Desktop Pan & Swipe)
wrapper.addEventListener('mousedown', (e) => {
    // Permit clicks through to interactable objects
    if (e.target.closest('.hotspot') || e.target.closest('button')) return;
    e.preventDefault();
    
    if (currentZoom > 1) {
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        wrapper.style.cursor = 'grabbing';
    } else {
        swipeStartX = e.clientX;
        swipeStartY = e.clientY;
        swipeStartTime = Date.now();
        isDragging = true;
    }
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    if (currentZoom > 1) {
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        applyZoom(false);
    }
});

window.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    wrapper.style.cursor = 'auto';

    if (currentZoom === 1) {
        const dx = e.clientX - swipeStartX;
        const dy = e.clientY - swipeStartY;
        const dt = Date.now() - swipeStartTime;

        if (dt < 500 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
            if (dx < 0) pageFlip.flipNext();
            else pageFlip.flipPrev();
        }
    }
});

/* ---------------------------------------------------
   PAGE EVENTS & CONTROLS
--------------------------------------------------- */
function updatePageIndicator() {
    if (!pageFlip) return;
    const current = pageFlip.getCurrentPageIndex() + 1;
    indicator.textContent = `${current} / ${TOTAL_PAGES}`;
}

document.getElementById("nextBtn").addEventListener("click", () => { if (pageFlip) pageFlip.flipNext(); });
document.getElementById("prevBtn").addEventListener("click", () => { if (pageFlip) pageFlip.flipPrev(); });
document.getElementById("firstBtn").addEventListener("click", () => { if (pageFlip) pageFlip.turnToPage(0); });
document.getElementById("lastBtn").addEventListener("click", () => { if (pageFlip) pageFlip.turnToPage(TOTAL_PAGES - 3); });

document.getElementById("zoomIn").addEventListener("click", () => {
    currentZoom = Math.min(currentZoom + 0.5, 3);
    applyZoom(true);
});

document.getElementById("zoomOut").addEventListener("click", () => {
    currentZoom = Math.max(currentZoom - 0.5, 1);
    applyZoom(true);
});

// Wheel zooming (ctrl + wheel)
window.addEventListener("wheel", (event) => {
    if (!event.ctrlKey) return;
    event.preventDefault();

    if (event.deltaY < 0) currentZoom += 0.1;
    else currentZoom -= 0.1;

    currentZoom = Math.max(1, Math.min(currentZoom, 3));
    applyZoom(true);
}, { passive: false });

// Wheel flipping (disabled when zoomed in)
let wheelTimeout;
flipbook.addEventListener("wheel", (event) => {
    if (event.ctrlKey || currentZoom > 1) return;
    event.preventDefault();
    clearTimeout(wheelTimeout);

    wheelTimeout = setTimeout(() => {
        if (event.deltaY > 0) pageFlip.flipNext();
        else pageFlip.flipPrev();
    }, 180);
}, { passive: false });

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

document.addEventListener("keydown", (event) => {
    if (!pageFlip) return;

    // Prevent Arrow keys from flipping the page while zoomed in
    if (currentZoom > 1 && (event.key === "ArrowRight" || event.key === "ArrowLeft")) return;

    switch (event.key) {
        case "ArrowRight": pageFlip.flipNext(); break;
        case "ArrowLeft": pageFlip.flipPrev(); break;
        case "Home": pageFlip.turnToPage(0); break;
        case "End": pageFlip.turnToPage(TOTAL_PAGES - 1); break;
        case "+": currentZoom = Math.min(currentZoom + 0.5, 3); applyZoom(true); break;
        case "-": currentZoom = Math.max(currentZoom - 0.5, 1); applyZoom(true); break;
        case "f":
        case "F": document.getElementById("fullscreenBtn").click(); break;
    }
});

function registerEvents() {
    pageFlip.on("init", () => {
        updatePageIndicator();
        hideLoader();
    });
    pageFlip.on("flip", () => updatePageIndicator());
    pageFlip.on("changeOrientation", () => updatePageIndicator());
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
    applyZoom(true);
}

window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(rebuildBook, 300);
});

document.addEventListener("fullscreenchange", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(rebuildBook, 300);
});

document.addEventListener("dragstart", (event) => event.preventDefault());
document.addEventListener("contextmenu", (event) => {
    if (event.target.tagName === "IMG") event.preventDefault();
});

function showLoader() { flipbook.classList.add("loading"); }
function hideLoader() { flipbook.classList.remove("loading"); }

showLoader();

loadPageAspectRatio().then(() => {
    initializeBook();
    registerEvents();
    updatePageIndicator();
    applyZoom(true);
});
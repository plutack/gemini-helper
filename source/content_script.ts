import browserAPI from "browser";
let imageDataUrl: string;
let tabID: number;

type Data = {
  response: string;
};

browserAPI.runtime.onMessage.addListener((message) => {
  if (message.type === "capture") {
    console.log("helllo again");
    startCaptureEvent();
    imageDataUrl = message.imageDataUrl;
    tabID = message.tabID;
    console.log(imageDataUrl);
  }
  return Promise.resolve({ response: "recieved from content script" });
});

let isCapturing = false;
// a canvas overlay on the whole screen to be triggered by a  mousedown event
function startCaptureEvent() {
  if (!isCapturing) {
    isCapturing = true;
    createOverlay();
    globalThis.addEventListener("resize", resizeCanvas);
    globalThis.addEventListener("keydown", exitCaptureEvent);
    document.addEventListener("mousedown", startSnip);
  }
}

function exitCaptureEvent(e?: KeyboardEvent) {
  console.log(e);
  if (!e || e.key === "Escape") {
    const canvas = document.querySelector("#gemini-helper");
    if (canvas) {
      canvas.remove();
    }
    document.removeEventListener("mousedown", startSnip);
    globalThis.removeEventListener("keydown", exitCaptureEvent);
    globalThis.removeEventListener("resize", resizeCanvas);
    isCapturing = false;
  }
}

function createOverlay() {
  const overlayCanvas = document.createElement("canvas");
  overlayCanvas.id = "gemini-helper";
  overlayCanvas.style.position = "fixed";
  overlayCanvas.style.zIndex = "10000";
  overlayCanvas.style.left = "0";
  overlayCanvas.style.top = "0";
  overlayCanvas.width = globalThis.innerWidth;
  overlayCanvas.height = globalThis.innerHeight;

  document.body.appendChild(overlayCanvas);
  const ctx = overlayCanvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  }
}

function resizeCanvas(_e: Event) {
  const canvas = document.querySelector("#gemini-helper") as
    | HTMLCanvasElement
    | null;
  if (canvas) {
    canvas.width = globalThis.innerWidth;
    canvas.height = globalThis.innerHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }
  console.log(`width ${canvas?.width} height ${canvas?.height}`);
}

let startX: number, startY: number;
let isSnipping = false;

function startSnip(e: MouseEvent) {
  if (isSnipping) return;

  startX = e.clientX;
  startY = e.clientY;
  isSnipping = true;

  const overlayCanvas = document.querySelector(
    "#gemini-helper",
  ) as HTMLCanvasElement;
  if (!overlayCanvas) return;

  const ctx = overlayCanvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  ctx.clearRect(startX, startY, 1, 1);
  document.addEventListener("mousemove", trackSnip);
  document.addEventListener("mouseup", endSnip);
  // create function to remove all event listeners?
}

function trackSnip(e: MouseEvent) {
  const overlayCanvas = document.querySelector(
    "#gemini-helper",
  ) as HTMLCanvasElement;
  if (!overlayCanvas) return;

  const ctx = overlayCanvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  ctx.clearRect(startX, startY, e.clientX - startX, e.clientY - startY);
  ctx.strokeStyle = "rgba(255, 0, 0, 0.7)";
  ctx.lineWidth = 2;
  ctx.strokeRect(startX, startY, e.clientX - startX, e.clientY - startY);
}

// considered using a closure function here so i can keep state.... check later
// async function captureScreenContent() {
//   const [tab] = await browserAPI.tabs.query({
//     active: true,
//     currentWindow: true,
//   });
//   const imageDataUrl = await browserAPI.tabs.captureVisibleTab(tab.windowId, {
//     format: "png",
//   });
//   return imageDataUrl;
// }

function endSnip(e: MouseEvent) {
  document.removeEventListener("mousemove", trackSnip);
  document.removeEventListener("mouseup", endSnip);

  const img = new Image();
  img.src = imageDataUrl;
  img.onload = () => {
    const overlayCanvas = document.querySelector(
      "#gemini-helper",
    ) as HTMLCanvasElement;
    if (!overlayCanvas) return;
    const width = e.clientX - startX;
    const height = e.clientY - startY;
    const snipCanvas = document.createElement("canvas");
    snipCanvas.width = width;
    snipCanvas.height = height;
    const snipCtx = snipCanvas.getContext("2d");
    if (!snipCtx) return;
    snipCtx.drawImage(
      img,
      startX,
      startY,
      width,
      height,
      0,
      0,
      width,
      height,
    );
    const snipDataUrl = snipCanvas.toDataURL();
    isSnipping = false;
    browserAPI.runtime.sendMessage(
      {
        type: "processImage",
        snipDataUrl,
        tabID,
      },
      {},
      (response: Data) => {
        console.log("Response received:", response.response);

        const overlayResponse = document.createElement("div");
        const bodyColor = document.body.style.backgroundColor;
        const textColor = document.body.style.color;
        overlayResponse.style.position = "fixed";
        overlayResponse.style.color = textColor;
        overlayResponse.style.bottom = "10px";
        overlayResponse.style.right = "10px";
        overlayResponse.style.maxWidth = "66vw";
        overlayResponse.style.maxHeight = "66vh";
        overlayResponse.style.overflow = "hidden";
        overlayResponse.style.backgroundColor = bodyColor;
        overlayResponse.style.border = "1px solid #ccc";
        overlayResponse.style.borderRadius = "10px";
        overlayResponse.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.3)";
        overlayResponse.style.zIndex = "1000";
        overlayResponse.style.padding = "15px";
        overlayResponse.style.fontFamily = "Arial, sans-serif";

        // next page if needed?
        const textContent = response.response;
        const pageSize = 900;
        let currentPage = 0;
        const totalPages = Math.ceil(textContent.length / pageSize);

        function updatePage() {
          textContainer.innerText = textContent.slice(
            currentPage * pageSize,
            (currentPage + 1) * pageSize,
          );
          pageIndicator.innerText = `Page ${currentPage + 1} of ${totalPages}`;
          prevButton.disabled = currentPage === 0;
          nextButton.disabled = currentPage === totalPages - 1;
        }

        // Content container for scrollable text
        const textContainer = document.createElement("div");
        textContainer.style.overflowY = "auto";
        textContainer.style.maxHeight = "calc(66vh - 80px)"; // need to adjust fot the buttons
        overlayResponse.appendChild(textContainer);

        const controlsContainer = document.createElement("div");
        controlsContainer.style.display = "flex";
        controlsContainer.style.justifyContent = "space-between";
        controlsContainer.style.marginTop = "10px";

        const prevButton = document.createElement("button");
        prevButton.textContent = "Previous";
        prevButton.onclick = () => {
          if (currentPage > 0) {
            currentPage--;
            updatePage();
          }
        };

        const nextButton = document.createElement("button");
        nextButton.textContent = "Next";
        nextButton.onclick = () => {
          if (currentPage < totalPages - 1) {
            currentPage++;
            updatePage();
          }
        };

        const pageIndicator = document.createElement("span");
        pageIndicator.style.alignSelf = "center";

        controlsContainer.appendChild(prevButton);
        controlsContainer.appendChild(pageIndicator);
        controlsContainer.appendChild(nextButton);

        // Close button
        const closeButton = document.createElement("button");
        closeButton.textContent = "Close";
        closeButton.style.position = "absolute";
        closeButton.style.top = "5px";
        closeButton.style.right = "5px";
        closeButton.onclick = () => overlayResponse.remove();

        // finalize overlay response structure // add margin perhaps?
        overlayResponse.appendChild(closeButton);
        overlayResponse.appendChild(controlsContainer);
        document.body.appendChild(overlayResponse);
        updatePage();
      },
    );
    exitCaptureEvent();
  };
}

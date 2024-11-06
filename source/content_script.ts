import browserAPI from "browser";

browserAPI.runtime.onMessage.addListener((message) => {
  console.log("helllo again");
  console.log(message.type);

  startCaptureEvent();
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

function exitCaptureEvent(e: KeyboardEvent) {
  console.log(e);
  if (e.key === "Escape") {
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
  overlayCanvas.style.color = "blue";
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
function endSnip(e: MouseEvent) {
  // Stop snipping and remove the event listeners or do it here.
  document.removeEventListener("mousemove", trackSnip);
  document.removeEventListener("mouseup", endSnip);
  const overlayCanvas = document.querySelector(
    "#gemini-helper",
  ) as HTMLCanvasElement;
  if (!overlayCanvas) return;
  const ctx = overlayCanvas.getContext("2d");
  if (!ctx) return;
  const width = e.clientX - startX;
  const height = e.clientY - startY;
  const snipCanvas = document.createElement("canvas");
  snipCanvas.width = width;
  snipCanvas.height = height;
  const snipCtx = snipCanvas.getContext("2d");
  if (!snipCtx) return;
  const imageData = ctx.getImageData(startX, startY, width, height);
  snipCtx.putImageData(imageData, 0, 0);
  const dataURL = snipCanvas.toDataURL("image/png");
  console.log("Snipped image data URL:", dataURL);
  // send this to background script
  const imgElement = document.createElement("img");
  imgElement.src = dataURL;
  document.body.appendChild(imgElement);
  isSnipping = false;
  // still need to reset the whole thing.
  // so canvas clean up? maybe deleting the whole thing entirely
}

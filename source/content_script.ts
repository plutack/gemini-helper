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
    document.addEventListener("mousedown", startSnip);
    globalThis.addEventListener("keydown", exitCaptureEvent);
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
    globalThis.addEventListener("onresize", (_event: Event) => {
      overlayCanvas.width = globalThis.innerWidth;
      overlayCanvas.height = globalThis.innerHeight;
      ctx.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    });
  }
}

function startSnip(e: Event) {
}

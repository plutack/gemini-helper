/* @jsx h */
import { h } from "preact";
import { useCallback } from "preact/hooks";
import browserAPI from "browser";

type Response = {
  response: string;
};
export default function CaptureButton() {
  const onClick = useCallback(() => {
    browserAPI.tabs.query({ active: true, lastFocusedWindow: true }).then(
      ([tab]) => {
        if (tab !== undefined) {
          console.log(tab.id);

          // chrome and mozilla handles this diffeernetly , one returns a callback one promise.
          // perhaps forced casting, cos now I need to fight typescript and deno browserApi function
          const imageDataUrlPromise = new Promise<string>((resolve, reject) => {
            const result = browserAPI.tabs.captureVisibleTab(tab.windowId, {
              format: "png",
            });
            if (result && typeof result.then === "function") {
              result.then(resolve, reject);
            } else {
              browserAPI.tabs.captureVisibleTab(
                tab.windowId,
                { format: "png" },
                // resolve, // maybe this works for chrome. will test later
              );
            }
          });

          imageDataUrlPromise.then((url) => {
            const response = browserAPI.tabs.sendMessage(tab.id!, {
              tabID: tab.id,
              type: "capture",
              imageDataUrl: url,
            }) as unknown as Promise<Response>;
            response.then((response) => console.log(response.response));
          }).catch(console.error);
        } else {
          console.log("no tabs");
        }
      },
    ).catch(console.error);
  }, []);

  return (
    <button onClick={onClick}>
      start capture
    </button>
  );
}

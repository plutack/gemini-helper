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
          // chrome and mozilla seems to handle this differently which is quite
          // disorienting, one returns promise, the other undefined since it uses
          // a callback to process the response recieved. mozilla is priority for now
          const response: Promise<Response> = browserAPI.tabs.sendMessage(
            tab.id!,
            {
              type: "capture",
            },
          ) as unknown as Promise<Response>;
          response.then((response) => {
            console.log(response.response);
          });
        } else {
          console.log("no tabs");
        }
      },
    ).catch(onerror);
  }, []);

  return (
    <button onClick={onClick}>
      start capture
    </button>
  );
}

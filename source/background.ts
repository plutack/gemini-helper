import browserAPI from "browser";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getStorageKey } from "./utilities/storage_helpers.ts";
let key: string;
let base64string: string;
// let tabID: number; // i might not need this if i am able to send a response and recieve it properly
// const prompt = browserAPI.storage.sync.get("prompt");
const prompt =
  "You are a 'know-it-all'guru. Analyse the image and give proper context on it as you deem fit. A lways try to explain. who a person is, or what not."; // finalize overlay response structure // add margin perhaps? // change the prompt to something much more precise. // Prompt should be settable by user too.

browserAPI.runtime.onMessage.addListener(async (message) => {
  console.log("request from content script");
  let response;
  try {
    if (message.type === "processImage") {
      base64string = message.snipDataUrl;
      // tabID = message.tabID;
      const response = await processWithGemini(prompt, base64string);
      console.log(response);
      return Promise.resolve({ response });
    }
  } catch {
    response = "No response from Gemini"; // if the api response fails. i probably still want to resolve it as a success
    return Promise.resolve({ response });
  }
});

async function processWithGemini(
  prompt: string,
  base64string: string,
): Promise<string> {
  // get gemini api from storage // will be in storage for sure. To be set in option page
  key = await getStorageKey("key");
  console.log("key", key);
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const image = {
    inlineData: {
      data: stripString(base64string),
      mimeType: "image/png",
    },
  };
  const result = await model.generateContent([prompt, image]);
  console.log("result", result);
  return result.response.text();
}
// maybe find a better way to provision the string without the unnecessary part? explore blob => arrayBuffer => base64string?
function stripString(fullString: string): string {
  return fullString.replace(/^data:image\/(png|jpeg);base64,/, "");
}

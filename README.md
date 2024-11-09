# Gemini-Helper Browser Extension
This extension allows you to crop any part of a webpage and get additional context in form of a closable popup in the right bottom side of the webpage. This source code builds compatible file for both Firefox and chrome based browser
[Image 1](!screenshots/twitter-gemini.png)
[Image 2](!screenshots/quiz-gemini.png)
# How to Build extension from source code
1. You need to download [Deno](https://deno.land/) in order to build this app.

2.  | Commands                  | What they Do      |
    | ------------------------- | ----------------- |
    | `deno run -A build.ts`    | bundles extension |
    | `deno run -A build.ts -w` | watch extension   |

3. Raw files for extension after running bundle command is at dist/ folder. Extension can then be temporary loaded to the browser as a temporary add-on depending on your browser of choice. This should only be used for testing as data is not persistent after closing your browser.

# Configuration
In the option page(configuration menu) for Gemini. Two config values are settable.
 - Gemini API key: This is compulsory to set. See [this section](<README#How to get Google-generative AI key>)
 - Prompt: This is sent alongside the image generated from the area selected. A default internal prompt is used if not set


# How to get Google-generative AI key
visit https://ai.google.dev/gemini-api/docs/api-key to generate your key

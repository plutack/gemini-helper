/* @jsx h */
import { h } from "preact";
import { useCallback, useEffect, useState } from "preact/hooks";

import {
  addStorageListener,
  getStorageKey,
  updateStorage,
} from "../utilities/storage_helpers.ts";

export interface HomeProps {
  default?: boolean;
  path?: string;
}

export default function Home(_props: HomeProps) {
  const [key, setKey] = useState<string>(""); // Holds the saved API key from storage
  const [prompt, setPrompt] = useState<string>(""); // Holds the saved prompt from storage
  const [keyInput, setKeyInput] = useState<string>(""); // Controls the API key input field
  const [promptInput, setPromptInput] = useState<string>(""); // Controls the prompt textarea

  // Load and set the initial values from storage for 'key'
  useEffect(() => {
    getStorageKey("key").then((value) => {
      setKey(value);
      setKeyInput(value); // Initialize the key input field with stored value
    });
    return addStorageListener(setKey, "key");
  }, [setKey]);

  // Load and set the initial values from storage for 'prompt'
  useEffect(() => {
    getStorageKey("prompt").then((value) => {
      setPrompt(value);
      setPromptInput(value); // Initialize the prompt textarea with stored value
    });
    return addStorageListener(setPrompt, "prompt");
  }, [setPrompt]);

  // Update the key input state
  const handleKeyChange = useCallback((e: Event) => {
    if (e.target instanceof HTMLInputElement) {
      setKeyInput(e.target.value);
    }
  }, []);

  // Update the prompt input state
  const handlePromptChange = useCallback((e: Event) => {
    if (e.target instanceof HTMLTextAreaElement) {
      setPromptInput(e.target.value);
    }
  }, []);

  // Save the key input value to storage
  const saveKey = useCallback(() => {
    updateStorage(keyInput, "key"); // Save 'keyInput' to storage under the 'key' key
    setKey(keyInput); // Update the key state with the new saved value
  }, [keyInput]);

  // Save the prompt input value to storage
  const savePrompt = useCallback(() => {
    updateStorage(promptInput, "prompt"); // Save 'promptInput' to storage under the 'prompt' key
    setPrompt(promptInput); // Update the prompt state with the new saved value
  }, [promptInput]);

  return (
    <div>
      <h1>It feels like home</h1>
      <a href="#options">go to options</a>
      <div>
        <input
          placeholder="Enter your Google Gemini API key..."
          value={keyInput} // Controlled by keyInput state
          onChange={handleKeyChange}
        />
        <button onClick={saveKey}>save</button>
      </div>
      <div>
        <textarea
          placeholder="Enter your prompt or leave blank to use the default prompt..."
          value={promptInput} // Controlled by promptInput state
          rows={10}
          cols={50}
          onChange={handlePromptChange}
        />
        <button onClick={savePrompt}>save</button>
      </div>
    </div>
  );
}

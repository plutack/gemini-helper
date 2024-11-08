import browserAPI from "browser";

const { storage } = browserAPI;
const KEY = "storage_key";

interface Update {
  key?: {
    newValue?: string;
    oldValue?: string;
  };
  prompt?: {
    newValue?: string;
    oldValue?: string;
  };
}

type Target = "key" | "prompt";
/**
 * In practice, I'd usually just export these as a hook for simplicity.
 * Keeping it as separate utility just to demonstrate unit testing with mock.
 * Check out storage_helpers.test.ts
 */

// Add listener to update on any changes to browser-sync storage
export function addStorageListener(
  callback: (str: string) => void,
  target: Target,
) {
  const updateStorage = (data: Update) =>
    callback(data[target]?.newValue || "");
  storage.onChanged.addListener(updateStorage);
  return () => storage.onChanged.removeListener(updateStorage);
}

export async function getStorageKey(target: Target): Promise<string> {
  const data = await storage.sync.get(target);
  console.log(data);
  return data[target];
}

export function updateStorage(inputData: string, target: Target) {
  storage.sync.set({ [target]: inputData });
}

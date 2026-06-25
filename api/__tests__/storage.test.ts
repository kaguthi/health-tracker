import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { getItem, removeItem, setItem } from "@/api/storage";

jest.mock("expo-secure-store");

describe("api/storage (native platform)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = "android";
  });

  it("setItem writes via SecureStore", async () => {
    await setItem("name", "Jelly");
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith("name", "Jelly");
  });

  it("getItem reads via SecureStore", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("Jelly");
    const result = await getItem("name");
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith("name");
    expect(result).toBe("Jelly");
  });

  it("removeItem deletes via SecureStore", async () => {
    await removeItem("name");
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("name");
  });
});

describe("api/storage (web platform)", () => {
  const store = new Map<string, string>();

  beforeAll(() => {
    (global as any).localStorage = {
      getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    store.clear();
    Platform.OS = "web";
  });

  it("setItem writes to localStorage, bypassing SecureStore", async () => {
    await setItem("email", "jelly@example.com");
    expect(store.get("email")).toBe("jelly@example.com");
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
  });

  it("getItem reads from localStorage, bypassing SecureStore", async () => {
    store.set("email", "jelly@example.com");
    const result = await getItem("email");
    expect(result).toBe("jelly@example.com");
    expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
  });

  it("getItem returns null for a missing key", async () => {
    const result = await getItem("missing");
    expect(result).toBeNull();
  });

  it("removeItem deletes from localStorage, bypassing SecureStore", async () => {
    store.set("email", "jelly@example.com");
    await removeItem("email");
    expect(store.has("email")).toBe(false);
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });
});

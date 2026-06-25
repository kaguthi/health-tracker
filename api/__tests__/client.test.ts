import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { deleteToken, getToken, saveToken } from "@/api/client";

jest.mock("expo-secure-store");

describe("api/client (native platform)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = "android";
  });

  it("saveToken stores the JWT via SecureStore", async () => {
    await saveToken("abc.def.ghi");
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      "JWT_TOKEN",
      "abc.def.ghi",
    );
  });

  it("getToken reads the JWT via SecureStore", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("stored-token");
    const result = await getToken();
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith("JWT_TOKEN");
    expect(result).toBe("stored-token");
  });

  it("getToken returns null when nothing is stored", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
    const result = await getToken();
    expect(result).toBeNull();
  });

  it("deleteToken removes the JWT via SecureStore", async () => {
    await deleteToken();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("JWT_TOKEN");
  });
});

describe("api/client (web platform)", () => {
  const store = new Map<string, string>();

  beforeAll(() => {
    // jsdom test environment provides window but not always sessionStorage by default in node env;
    // jest-expo's RN preset uses jsdom which ships sessionStorage already, but we stub defensively.
    (global as any).sessionStorage = {
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

  it("saveToken stores the JWT in sessionStorage, bypassing SecureStore", async () => {
    await saveToken("web-token");
    expect(store.get("JWT_TOKEN")).toBe("web-token");
    expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
  });

  it("getToken reads the JWT from sessionStorage, bypassing SecureStore", async () => {
    store.set("JWT_TOKEN", "web-token");
    const result = await getToken();
    expect(result).toBe("web-token");
    expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
  });

  it("getToken returns null when sessionStorage is empty", async () => {
    const result = await getToken();
    expect(result).toBeNull();
  });

  it("deleteToken removes the JWT from sessionStorage, bypassing SecureStore", async () => {
    store.set("JWT_TOKEN", "web-token");
    await deleteToken();
    expect(store.has("JWT_TOKEN")).toBe(false);
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });
});

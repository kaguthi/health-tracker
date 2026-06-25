import React from "react";
import { renderHook, waitFor } from "@testing-library/react-native";
import { deleteToken, getToken } from "@/api/client";
import { getItem, removeItem } from "@/api/storage";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

jest.mock("@/api/client");
jest.mock("@/api/storage");

const mockedGetToken = getToken as jest.Mock;
const mockedDeleteToken = deleteToken as jest.Mock;
const mockedGetItem = getItem as jest.Mock;
const mockedRemoveItem = removeItem as jest.Mock;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe("useAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockedGetItem.mockResolvedValue(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("throws when used outside of an AuthProvider", async () => {
    await expect(renderHook(() => useAuth())).rejects.toThrow(
      "useAuth must be used within an AuthProvider",
    );
  });

  it("starts unauthenticated and loading, then resolves to unauthenticated with no stored token", async () => {
    mockedGetToken.mockResolvedValue(null);

    const { result } = await renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBeUndefined();
  });

  it("restores an authenticated session when a token is already stored", async () => {
    mockedGetToken.mockResolvedValue("stored-jwt");
    mockedGetItem.mockImplementation(async (key: string) => {
      if (key === "name") return "Jelly";
      if (key === "email") return "jelly@example.com";
      return null;
    });

    const { result } = await renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe("stored-jwt");
    expect(result.current.name).toBe("Jelly");
    expect(result.current.mail).toBe("jelly@example.com");
  });

  it("logs the error and still stops loading if reading storage fails", async () => {
    mockedGetToken.mockRejectedValue(new Error("SecureStore unavailable"));

    const { result } = await renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(false);
    expect(console.error).toHaveBeenCalledWith(
      "Failed to load user from secure storage",
      "SecureStore unavailable",
    );
  });

  it("logout clears the token, profile fields, and authenticated flag", async () => {
    mockedGetToken.mockResolvedValue("stored-jwt");
    mockedGetItem.mockImplementation(async (key: string) => {
      if (key === "name") return "Jelly";
      if (key === "email") return "jelly@example.com";
      return null;
    });

    const { result } = await renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    await result.current.logout();

    expect(mockedDeleteToken).toHaveBeenCalledTimes(1);
    expect(mockedRemoveItem).toHaveBeenCalledWith("name");
    expect(mockedRemoveItem).toHaveBeenCalledWith("email");
    expect(mockedRemoveItem).toHaveBeenCalledWith("authenticated");

    await waitFor(() => expect(result.current.isAuthenticated).toBe(false));
    expect(result.current.token).toBeUndefined();
    expect(result.current.name).toBeUndefined();
    expect(result.current.mail).toBeUndefined();
  });

  it("exposes setters that let consumers update auth state directly (e.g. after login)", async () => {
    mockedGetToken.mockResolvedValue(null);

    const { result } = await renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    result.current.setToken("new-jwt");
    result.current.setName("New User");
    result.current.setMail("new@example.com");
    result.current.setIsAuthenticated(true);

    await waitFor(() => expect(result.current.token).toBe("new-jwt"));
    expect(result.current.name).toBe("New User");
    expect(result.current.mail).toBe("new@example.com");
    expect(result.current.isAuthenticated).toBe(true);
  });
});

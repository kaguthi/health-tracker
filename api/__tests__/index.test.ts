import { addUser, initiateDonation, login } from "@/api/index";

function mockFetchOnce(
  body: any,
  { ok = true, status = 200 }: { ok?: boolean; status?: number } = {},
) {
  (global as any).fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    json: jest.fn().mockResolvedValue(body),
  });
}

describe("api/index", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("login", () => {
    it("posts credentials and returns the parsed JSON on success", async () => {
      mockFetchOnce({ token: "jwt-123" });

      const result = await login("jelly@example.com", "secret");

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.test.local/login",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "jelly@example.com",
            password: "secret",
          }),
        }),
      );
      expect(result).toEqual({ token: "jwt-123" });
    });

    it("throws the server's error message on a failed response", async () => {
      mockFetchOnce({ message: "Invalid credentials" }, { ok: false, status: 401 });

      await expect(login("jelly@example.com", "wrong")).rejects.toThrow(
        "Invalid credentials",
      );
    });

    it("falls back to a generic status message when the error body is unparsable", async () => {
      (global as any).fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: jest.fn().mockRejectedValue(new Error("not json")),
      });

      await expect(login("jelly@example.com", "secret")).rejects.toThrow(
        "Request failed: 500",
      );
    });
  });

  describe("addUser", () => {
    it("posts registration details and returns only the message field", async () => {
      mockFetchOnce({ message: "Account created" });

      const result = await addUser("Jelly", "jelly@example.com", "secret");

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.test.local/register",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            name: "Jelly",
            email: "jelly@example.com",
            password: "secret",
          }),
        }),
      );
      expect(result).toBe("Account created");
    });

    it("throws the server's error message when registration fails", async () => {
      mockFetchOnce({ message: "Email already taken" }, { ok: false, status: 409 });

      await expect(
        addUser("Jelly", "jelly@example.com", "secret"),
      ).rejects.toThrow("Email already taken");
    });
  });

  describe("initiateDonation", () => {
    it("posts amount and phone, returning the raw JSON regardless of status", async () => {
      mockFetchOnce({ status: "pending", checkoutId: "abc" });

      const result = await initiateDonation(100, "254712345678");

      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.test.local/donate",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ amount: 100, phone: "254712345678" }),
        }),
      );
      expect(result).toEqual({ status: "pending", checkoutId: "abc" });
    });
  });
});

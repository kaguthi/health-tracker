import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { initiateDonation } from "@/api";
import { router } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import DonationScreen from "../donation";

jest.mock("@/api");
jest.mock("@/hooks/useAuth");
jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
}));

const mockedInitiateDonation = initiateDonation as jest.Mock;
const mockedUseAuth = useAuth as jest.Mock;

describe("DonationScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    mockedUseAuth.mockReturnValue({ token: "jwt-123" });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("defaults to the 'Starter' (KSh 50) preset and shows the matching button label", async () => {
    const { getByText } = await render(<DonationScreen />);

    expect(getByText("Send KSh 50 via M-Pesa")).toBeTruthy();
  });

  it("switches the displayed amount when a different preset is tapped", async () => {
    const { getByText } = await render(<DonationScreen />);

    await fireEvent.press(getByText("KSh 500"));

    expect(getByText("Send KSh 500 via M-Pesa")).toBeTruthy();
  });

  it("prefers a typed custom amount over the selected preset", async () => {
    const { getByPlaceholderText, getByText } = await render(
      <DonationScreen />,
    );

    await fireEvent.changeText(getByPlaceholderText("Custom amount"), "250");

    expect(getByText("Send KSh 250 via M-Pesa")).toBeTruthy();
  });

  it("strips non-numeric characters out of the custom amount field", async () => {
    const { getByPlaceholderText, getByText } = await render(
      <DonationScreen />,
    );

    await fireEvent.changeText(
      getByPlaceholderText("Custom amount"),
      "1a2b3c",
    );

    expect(getByText("Send KSh 123 via M-Pesa")).toBeTruthy();
  });

  it("rejects submission with a zero custom amount before calling the API", async () => {
    const { getByPlaceholderText, getByText } = await render(
      <DonationScreen />,
    );

    await fireEvent.changeText(getByPlaceholderText("Custom amount"), "0");
    await fireEvent.changeText(
      getByPlaceholderText("0712 345 678"),
      "0712345678",
    );
    await fireEvent.press(getByText("Send KSh 0 via M-Pesa"));

    expect(
      getByText("Please enter a valid donation amount."),
    ).toBeTruthy();
    expect(mockedInitiateDonation).not.toHaveBeenCalled();
  });

  it.each([
    ["712345678", "missing the leading 0 or 254 prefix"],
    ["07123", "too short"],
  ])(
    "rejects submission when the phone number is invalid (%s — %s)",
    async (phone) => {
      const { getByPlaceholderText, getByText } = await render(
        <DonationScreen />,
      );

      await fireEvent.changeText(getByPlaceholderText("0712 345 678"), phone);
      await fireEvent.press(getByText("Send KSh 50 via M-Pesa"));

      expect(
        getByText("Please enter a valid M-Pesa number (e.g. 0712 345 678)."),
      ).toBeTruthy();
      expect(mockedInitiateDonation).not.toHaveBeenCalled();
    },
  );

  it("normalises a 07-prefixed number to 254-prefixed before calling the API", async () => {
    mockedInitiateDonation.mockResolvedValue({ status: "pending" });
    const { getByPlaceholderText, getByText } = await render(
      <DonationScreen />,
    );

    await fireEvent.changeText(
      getByPlaceholderText("0712 345 678"),
      "0712 345 678",
    );
    await fireEvent.press(getByText("Send KSh 50 via M-Pesa"));

    await waitFor(() =>
      expect(mockedInitiateDonation).toHaveBeenCalledWith(
        50,
        "254712345678",
      ),
    );
  });

  it("passes an already-254-prefixed number through unchanged", async () => {
    mockedInitiateDonation.mockResolvedValue({ status: "pending" });
    const { getByPlaceholderText, getByText } = await render(
      <DonationScreen />,
    );

    await fireEvent.changeText(
      getByPlaceholderText("0712 345 678"),
      "254712345678",
    );
    await fireEvent.press(getByText("Send KSh 50 via M-Pesa"));

    await waitFor(() =>
      expect(mockedInitiateDonation).toHaveBeenCalledWith(
        50,
        "254712345678",
      ),
    );
  });

  it("shows a connecting state while the donation request is in flight, then navigates to success", async () => {
    let resolveDonation: (value: unknown) => void;
    mockedInitiateDonation.mockReturnValue(
      new Promise((resolve) => {
        resolveDonation = resolve;
      }),
    );

    const { getByPlaceholderText, getByText, queryByText } = await render(
      <DonationScreen />,
    );

    await fireEvent.changeText(
      getByPlaceholderText("0712 345 678"),
      "0712345678",
    );

    // Intentionally not awaited: the handler's promise won't resolve until
    // we call resolveDonation below, so awaiting fireEvent.press here would
    // hang. waitFor below polls until the "loading" state has committed.
    fireEvent.press(getByText("Send KSh 50 via M-Pesa"));

    await waitFor(() =>
      expect(getByText("Connecting to M-Pesa…")).toBeTruthy(),
    );
    expect(queryByText("Send KSh 50 via M-Pesa")).toBeNull();

    resolveDonation!({ status: "pending" });

    await waitFor(() =>
      expect(router.push).toHaveBeenCalledWith("/(page)/success"),
    );
  });

  it("shows a generic error and logs the cause if the donation request fails", async () => {
    mockedInitiateDonation.mockRejectedValue(new Error("network down"));
    const { getByPlaceholderText, getByText } = await render(
      <DonationScreen />,
    );

    await fireEvent.changeText(
      getByPlaceholderText("0712 345 678"),
      "0712345678",
    );
    await fireEvent.press(getByText("Send KSh 50 via M-Pesa"));

    await waitFor(() =>
      expect(
        getByText("Something went wrong. Please try again."),
      ).toBeTruthy(),
    );
    expect(console.error).toHaveBeenCalledWith(
      "Donation initiation failed:",
      "network down",
    );
    expect(router.push).not.toHaveBeenCalled();
    // Button should be re-enabled (back to its normal label) after the failure
    expect(getByText("Send KSh 50 via M-Pesa")).toBeTruthy();
  });

  it("clears a previously shown error once the person edits the amount or phone field", async () => {
    const { getByPlaceholderText, getByText, queryByText } = await render(
      <DonationScreen />,
    );

    await fireEvent.changeText(getByPlaceholderText("Custom amount"), "0");
    await fireEvent.press(getByText("Send KSh 0 via M-Pesa"));
    expect(getByText("Please enter a valid donation amount.")).toBeTruthy();

    await fireEvent.changeText(getByPlaceholderText("Custom amount"), "200");

    expect(
      queryByText("Please enter a valid donation amount."),
    ).toBeNull();
  });
});

import { waitFor } from "@testing-library/react-native";
import { renderHook } from "@testing-library/react-native";
import {
  readActiveCalories,
  readDistance,
  readHeartRate,
  readSleep,
  readSteps,
} from "@/api/healthConnect";
import { useHealthData } from "@/hooks/useHealthData";

jest.mock("@/api/healthConnect");

const mockedReadSteps = readSteps as jest.Mock;
const mockedReadActiveCalories = readActiveCalories as jest.Mock;
const mockedReadHeartRate = readHeartRate as jest.Mock;
const mockedReadSleep = readSleep as jest.Mock;
const mockedReadDistance = readDistance as jest.Mock;

describe("useHealthData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("starts with zeroed/empty defaults while the fetch is still pending", async () => {
    // Use a promise that never resolves so we can inspect the hook's
    // initial state before any Health Connect data has arrived.
    const pending = new Promise(() => {});
    mockedReadSteps.mockReturnValue(pending);
    mockedReadActiveCalories.mockReturnValue(pending);
    mockedReadHeartRate.mockReturnValue(pending);
    mockedReadSleep.mockReturnValue(pending);
    mockedReadDistance.mockReturnValue(pending);

    const { result } = await renderHook(() => useHealthData());

    expect(result.current.steps).toBe(0);
    expect(result.current.activeCalories).toBe(0);
    expect(result.current.heartRate).toEqual([]);
    expect(result.current.sleep).toEqual([]);
    expect(result.current.distance).toBe(0);
    expect(result.current.error).toBe("");
  });

  it("populates state from all five Health Connect sources once resolved", async () => {
    mockedReadSteps.mockResolvedValue(8421);
    mockedReadActiveCalories.mockResolvedValue(312);
    mockedReadHeartRate.mockResolvedValue([
      { time: "t1", beatsPerMinute: 70 },
    ]);
    mockedReadSleep.mockResolvedValue([
      {
        startTime: "2026-06-22T22:00:00.000Z",
        endTime: "2026-06-23T06:00:00.000Z",
        stages: [{ stage: 4, startTime: "a", endTime: "b" }],
      },
    ]);
    mockedReadDistance.mockResolvedValue(5.43);

    const { result } = await renderHook(() => useHealthData());

    await waitFor(() => expect(result.current.steps).toBe(8421));

    expect(result.current.activeCalories).toBe(312);
    expect(result.current.heartRate).toEqual([
      { time: "t1", beatsPerMinute: 70 },
    ]);
    expect(result.current.sleep).toEqual([
      {
        startTime: "2026-06-22T22:00:00.000Z",
        endTime: "2026-06-23T06:00:00.000Z",
        stages: [{ stage: 4, startTime: "a", endTime: "b" }],
      },
    ]);
    expect(result.current.distance).toBe(5.43);
    expect(result.current.error).toBe("");
  });

  it("falls back to defaults when any source resolves to null (permission denied)", async () => {
    mockedReadSteps.mockResolvedValue(null);
    mockedReadActiveCalories.mockResolvedValue(null);
    mockedReadHeartRate.mockResolvedValue(null);
    mockedReadSleep.mockResolvedValue(null);
    mockedReadDistance.mockResolvedValue(null);

    const { result } = await renderHook(() => useHealthData());

    await waitFor(() => expect(mockedReadSteps).toHaveBeenCalled());

    expect(result.current.steps).toBe(0);
    expect(result.current.activeCalories).toBe(0);
    expect(result.current.heartRate).toEqual([]);
    expect(result.current.sleep).toEqual([]);
    expect(result.current.distance).toBe(0);
    expect(result.current.error).toBe("");
  });

  it("defaults a sleep record's stages to an empty array when missing", async () => {
    mockedReadSteps.mockResolvedValue(0);
    mockedReadActiveCalories.mockResolvedValue(0);
    mockedReadHeartRate.mockResolvedValue([]);
    mockedReadSleep.mockResolvedValue([
      { startTime: "a", endTime: "b" }, // no `stages` field at all
    ]);
    mockedReadDistance.mockResolvedValue(0);

    const { result } = await renderHook(() => useHealthData());

    await waitFor(() => expect(result.current.sleep).toHaveLength(1));

    expect(result.current.sleep[0].stages).toEqual([]);
  });

  it("sets a user-facing error and logs the cause when any source rejects", async () => {
    mockedReadSteps.mockResolvedValue(100);
    mockedReadActiveCalories.mockResolvedValue(50);
    mockedReadHeartRate.mockResolvedValue([]);
    mockedReadSleep.mockRejectedValue(new Error("Health Connect crashed"));
    mockedReadDistance.mockResolvedValue(1);

    const { result } = await renderHook(() => useHealthData());

    await waitFor(() =>
      expect(result.current.error).toBe(
        "Failed to load health data. Please try again later.",
      ),
    );

    expect(console.error).toHaveBeenCalledWith(
      "Error fetching health data:",
      "Health Connect crashed",
    );
    // State that hadn't been set before the rejection stays at its default
    expect(result.current.steps).toBe(0);
  });
});

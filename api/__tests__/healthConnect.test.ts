import {
  initialize,
  insertRecords,
  readRecords,
  requestPermission,
} from "react-native-health-connect";
import {
  readActiveCalories,
  readDistance,
  readHeartRate,
  readSleep,
  readSteps,
  writeActiveCalories,
  writeHeartRate,
  writeSleep,
  writeSteps,
} from "@/api/healthConnect";

jest.mock("react-native-health-connect", () => ({
  initialize: jest.fn(),
  insertRecords: jest.fn(),
  readRecords: jest.fn(),
  requestPermission: jest.fn(),
}));

const mockedInitialize = initialize as jest.Mock;
const mockedInsertRecords = insertRecords as jest.Mock;
const mockedReadRecords = readRecords as jest.Mock;
const mockedRequestPermission = requestPermission as jest.Mock;

describe("api/healthConnect", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("init/permission guard (shared across all read/write functions)", () => {
    it("returns null and never reads records when Health Connect fails to initialize", async () => {
      mockedInitialize.mockResolvedValue(false);

      const result = await readSteps();

      expect(result).toBeNull();
      expect(mockedRequestPermission).not.toHaveBeenCalled();
      expect(mockedReadRecords).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        "Health Connect initialization failed",
      );
    });

    it("returns null and never reads records when permission is denied", async () => {
      mockedInitialize.mockResolvedValue(true);
      mockedRequestPermission.mockResolvedValue([]);

      const result = await readSteps();

      expect(result).toBeNull();
      expect(mockedReadRecords).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith("Permissions not granted");
    });

    it("requests the correct permission shape for a read", async () => {
      mockedInitialize.mockResolvedValue(true);
      mockedRequestPermission.mockResolvedValue([
        { accessType: "read", recordType: "Steps" },
      ]);
      mockedReadRecords.mockResolvedValue({ records: [] });

      await readSteps();

      expect(mockedRequestPermission).toHaveBeenCalledWith([
        { accessType: "read", recordType: "Steps" },
      ]);
    });

    it.each([
      ["readActiveCalories", readActiveCalories],
      ["readHeartRate", readHeartRate],
      ["readSleep", readSleep],
      ["readDistance", readDistance],
    ])(
      "%s returns null without reading records when initialization fails",
      async (_name, fn) => {
        mockedInitialize.mockResolvedValue(false);

        const result = await fn();

        expect(result).toBeNull();
        expect(mockedReadRecords).not.toHaveBeenCalled();
      },
    );

    it.each([
      ["readActiveCalories", readActiveCalories],
      ["readHeartRate", readHeartRate],
      ["readSleep", readSleep],
      ["readDistance", readDistance],
    ])(
      "%s returns null without reading records when permission is denied",
      async (_name, fn) => {
        mockedInitialize.mockResolvedValue(true);
        mockedRequestPermission.mockResolvedValue([]);

        const result = await fn();

        expect(result).toBeNull();
        expect(mockedReadRecords).not.toHaveBeenCalled();
      },
    );
  });

  describe("readSteps", () => {
    beforeEach(() => {
      mockedInitialize.mockResolvedValue(true);
      mockedRequestPermission.mockResolvedValue([
        { accessType: "read", recordType: "Steps" },
      ]);
    });

    it("sums step counts across all records", async () => {
      mockedReadRecords.mockResolvedValue({
        records: [{ count: 3000 }, { count: 4500 }, { count: 200 }],
      });

      const result = await readSteps();

      expect(result).toBe(7700);
    });

    it("returns 0 (not null) when granted but there are no records", async () => {
      mockedReadRecords.mockResolvedValue({ records: [] });

      const result = await readSteps();

      expect(result).toBe(0);
    });

    it("queries Steps with a same-day time range filter", async () => {
      mockedReadRecords.mockResolvedValue({ records: [] });

      await readSteps();

      expect(mockedReadRecords).toHaveBeenCalledWith(
        "Steps",
        expect.objectContaining({
          timeRangeFilter: expect.objectContaining({ operator: "between" }),
        }),
      );
      const [, options] = mockedReadRecords.mock.calls[0];
      const { startTime, endTime } = options.timeRangeFilter;
      expect(new Date(startTime).getHours()).toBe(0);
      expect(new Date(startTime).getMinutes()).toBe(0);
      expect(new Date(endTime).getTime()).toBeGreaterThanOrEqual(
        new Date(startTime).getTime(),
      );
    });
  });

  describe("readActiveCalories", () => {
    beforeEach(() => {
      mockedInitialize.mockResolvedValue(true);
      mockedRequestPermission.mockResolvedValue([
        { accessType: "read", recordType: "ActiveCaloriesBurned" },
      ]);
    });

    it("sums kilocalories across all records", async () => {
      mockedReadRecords.mockResolvedValue({
        records: [
          { energy: { inKilocalories: 120.5 } },
          { energy: { inKilocalories: 80 } },
        ],
      });

      const result = await readActiveCalories();

      expect(result).toBe(200.5);
    });
  });

  describe("readHeartRate", () => {
    beforeEach(() => {
      mockedInitialize.mockResolvedValue(true);
      mockedRequestPermission.mockResolvedValue([
        { accessType: "read", recordType: "HeartRate" },
      ]);
    });

    it("flattens samples from every record into one array", async () => {
      mockedReadRecords.mockResolvedValue({
        records: [
          { samples: [{ time: "t1", beatsPerMinute: 70 }] },
          {
            samples: [
              { time: "t2", beatsPerMinute: 72 },
              { time: "t3", beatsPerMinute: 75 },
            ],
          },
        ],
      });

      const result = await readHeartRate();

      expect(result).toEqual([
        { time: "t1", beatsPerMinute: 70 },
        { time: "t2", beatsPerMinute: 72 },
        { time: "t3", beatsPerMinute: 75 },
      ]);
    });

    it("returns an empty array when there are no records", async () => {
      mockedReadRecords.mockResolvedValue({ records: [] });

      const result = await readHeartRate();

      expect(result).toEqual([]);
    });
  });

  describe("readDistance", () => {
    beforeEach(() => {
      mockedInitialize.mockResolvedValue(true);
      mockedRequestPermission.mockResolvedValue([
        { accessType: "read", recordType: "Distance" },
      ]);
    });

    it("sums meters and converts to kilometers rounded to 2 decimals", async () => {
      // 1234.567 + 5000 = 6234.567m -> 6.234567km -> rounds to 6.23km
      mockedReadRecords.mockResolvedValue({
        records: [
          { distance: { inMeters: 1234.567 } },
          { distance: { inMeters: 5000 } },
        ],
      });

      const result = await readDistance();

      expect(result).toBe(6.23);
    });

    it("returns 0 when there are no distance records", async () => {
      mockedReadRecords.mockResolvedValue({ records: [] });

      const result = await readDistance();

      expect(result).toBe(0);
    });
  });

  describe("readSleep", () => {
    beforeEach(() => {
      mockedInitialize.mockResolvedValue(true);
      mockedRequestPermission.mockResolvedValue([
        { accessType: "read", recordType: "SleepSession" },
      ]);
    });

    it("returns raw sleep session records spanning yesterday through now", async () => {
      const sessions = [
        { startTime: "a", endTime: "b", stages: [] },
      ];
      mockedReadRecords.mockResolvedValue({ records: sessions });

      const result = await readSleep();

      expect(result).toEqual(sessions);
      const [, options] = mockedReadRecords.mock.calls[0];
      const { startTime, endTime } = options.timeRangeFilter;
      const spanHours =
        (new Date(endTime).getTime() - new Date(startTime).getTime()) /
        (1000 * 60 * 60);
      // Range covers at least a full day (yesterday 00:00 -> now)
      expect(spanHours).toBeGreaterThanOrEqual(24);
    });
  });

  describe("write functions", () => {
    it("writeSteps inserts records once permission is granted", async () => {
      mockedInitialize.mockResolvedValue(true);
      mockedRequestPermission.mockResolvedValue([
        { accessType: "write", recordType: "Steps" },
      ]);
      mockedInsertRecords.mockResolvedValue(undefined);

      await writeSteps();

      expect(mockedInsertRecords).toHaveBeenCalledTimes(1);
      const [records] = mockedInsertRecords.mock.calls[0];
      expect(records).toHaveLength(3);
      expect(records[0].recordType).toBe("Steps");
    });

    it("writeSteps does not insert records when permission is denied", async () => {
      mockedInitialize.mockResolvedValue(true);
      mockedRequestPermission.mockResolvedValue([]);

      await writeSteps();

      expect(mockedInsertRecords).not.toHaveBeenCalled();
    });

    it.each([
      ["writeHeartRate", writeHeartRate],
      ["writeSleep", writeSleep],
      ["writeActiveCalories", writeActiveCalories],
    ])("%s does not insert records when permission is denied", async (_name, fn) => {
      mockedInitialize.mockResolvedValue(true);
      mockedRequestPermission.mockResolvedValue([]);

      await fn();

      expect(mockedInsertRecords).not.toHaveBeenCalled();
    });

    it("writeSteps logs an error and does not throw if insertRecords rejects", async () => {
      mockedInitialize.mockResolvedValue(true);
      mockedRequestPermission.mockResolvedValue([
        { accessType: "write", recordType: "Steps" },
      ]);
      mockedInsertRecords.mockRejectedValue(new Error("insert failed"));

      await expect(writeSteps()).resolves.toBeUndefined();
      expect(console.error).toHaveBeenCalledWith(
        "Error inserting step records:",
        expect.any(Error),
      );
    });

    it("writeHeartRate logs an error and does not throw if insertRecords rejects", async () => {
      mockedInitialize.mockResolvedValue(true);
      mockedRequestPermission.mockResolvedValue([
        { accessType: "write", recordType: "HeartRate" },
      ]);
      mockedInsertRecords.mockRejectedValue(new Error("insert failed"));

      await expect(writeHeartRate()).resolves.toBeUndefined();
      expect(console.error).toHaveBeenCalledWith(
        "Error inserting heart rate records:",
        expect.any(Error),
      );
    });

    it("writeSleep logs an error and does not throw if insertRecords rejects", async () => {
      mockedInitialize.mockResolvedValue(true);
      mockedRequestPermission.mockResolvedValue([
        { accessType: "write", recordType: "SleepSession" },
      ]);
      mockedInsertRecords.mockRejectedValue(new Error("insert failed"));

      await expect(writeSleep()).resolves.toBeUndefined();
      expect(console.error).toHaveBeenCalledWith(
        "Error inserting sleep records:",
        expect.any(Error),
      );
    });

    it("writeActiveCalories logs an error and does not throw if insertRecords rejects", async () => {
      mockedInitialize.mockResolvedValue(true);
      mockedRequestPermission.mockResolvedValue([
        { accessType: "write", recordType: "ActiveCaloriesBurned" },
      ]);
      mockedInsertRecords.mockRejectedValue(new Error("insert failed"));

      await expect(writeActiveCalories()).resolves.toBeUndefined();
      expect(console.error).toHaveBeenCalledWith(
        "Error inserting active calories records:",
        expect.any(Error),
      );
    });

    it("writeHeartRate inserts a session with bpm samples", async () => {
      mockedInitialize.mockResolvedValue(true);
      mockedRequestPermission.mockResolvedValue([
        { accessType: "write", recordType: "HeartRate" },
      ]);
      mockedInsertRecords.mockResolvedValue(undefined);

      await writeHeartRate();

      const [records] = mockedInsertRecords.mock.calls[0];
      expect(records[0].recordType).toBe("HeartRate");
      expect(records[0].samples.length).toBeGreaterThan(0);
    });

    it("writeSleep inserts a session with stage segments", async () => {
      mockedInitialize.mockResolvedValue(true);
      mockedRequestPermission.mockResolvedValue([
        { accessType: "write", recordType: "SleepSession" },
      ]);
      mockedInsertRecords.mockResolvedValue(undefined);

      await writeSleep();

      const [records] = mockedInsertRecords.mock.calls[0];
      expect(records[0].recordType).toBe("SleepSession");
      expect(records[0].stages.length).toBe(4);
    });

    it("writeActiveCalories inserts an energy record", async () => {
      mockedInitialize.mockResolvedValue(true);
      mockedRequestPermission.mockResolvedValue([
        { accessType: "write", recordType: "ActiveCaloriesBurned" },
      ]);
      mockedInsertRecords.mockResolvedValue(undefined);

      await writeActiveCalories();

      const [records] = mockedInsertRecords.mock.calls[0];
      expect(records[0].recordType).toBe("ActiveCaloriesBurned");
      expect(records[0].energy).toEqual({ value: 500, unit: "kilocalories" });
    });
  });
});

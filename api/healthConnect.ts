import {
  initialize,
  insertRecords,
  readRecords,
  requestPermission,
} from "react-native-health-connect";

const healthConnectInitAndPermission = async (permissions: any) => {
  const initialized = await initialize();
  if (!initialized) {
    console.error("Health Connect initialization failed");
    return { initialized: false, grantedPermissions: [] };
  }

  const grantedPermissions = await requestPermission(permissions);

  if (!grantedPermissions.length) {
    console.error("Permissions not granted");
    return { initialized: true, grantedPermissions: [] };
  }

  return { initialized: true, grantedPermissions };
};

const getTodayRange = () => {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  return { startTime: startOfDay.toISOString(), endTime: now.toISOString() };
};

export const readActiveCalories = async () => {
  const { initialized, grantedPermissions } =
    await healthConnectInitAndPermission([
      { accessType: "read", recordType: "ActiveCaloriesBurned" },
    ]);

  if (!initialized || !grantedPermissions.length) {
    return null;
  }

  const { records } = await readRecords("ActiveCaloriesBurned", {
    timeRangeFilter: { operator: "between", ...getTodayRange() },
  });

  return records.reduce((sum, r) => sum + r.energy.inKilocalories, 0);
};

export const readSteps = async () => {
  const { initialized, grantedPermissions } =
    await healthConnectInitAndPermission([
      { accessType: "read", recordType: "Steps" },
    ]);

  if (!initialized || !grantedPermissions.length) {
    return null;
  }

  const { records } = await readRecords("Steps", {
    timeRangeFilter: { operator: "between", ...getTodayRange() },
  });

  return records.reduce((sum, r) => sum + r.count, 0);
};

export const readHeartRate = async () => {
  const { initialized, grantedPermissions } =
    await healthConnectInitAndPermission([
      { accessType: "read", recordType: "HeartRate" },
    ]);

  if (!initialized || !grantedPermissions.length) {
    return null;
  }

  const { records } = await readRecords("HeartRate", {
    timeRangeFilter: { operator: "between", ...getTodayRange() },
  });

  console.log("Heart rate records:", JSON.stringify(records));

  return records.flatMap((r) => r.samples);
};

export const readSleep = async () => {
  const { initialized, grantedPermissions } =
    await healthConnectInitAndPermission([
      { accessType: "read", recordType: "SleepSession" },
    ]);

  if (!initialized || !grantedPermissions.length) {
    return null;
  }

  const now = new Date();
  const startOfYesterday = new Date(now);
  startOfYesterday.setDate(now.getDate() - 1);
  startOfYesterday.setHours(0, 0, 0, 0);

  const { records } = await readRecords("SleepSession", {
    timeRangeFilter: {
      operator: "between",
      startTime: startOfYesterday.toISOString(),
      endTime: now.toISOString(),
    },
  });

  return records;
};

export const readDistance = async () => {
  const { initialized, grantedPermissions } =
    await healthConnectInitAndPermission([
      { accessType: "read", recordType: "Distance" },
    ]);

  if (!initialized || !grantedPermissions.length) {
    return null;
  }

  const { records } = await readRecords("Distance", {
    timeRangeFilter: { operator: "between", ...getTodayRange() },
  });

  const totalMeters = records.reduce((sum, r) => sum + r.distance.inMeters, 0);
  return Math.round(totalMeters / 10) / 100;
};

export const writeSteps = async () => {
  const { initialized, grantedPermissions } =
    await healthConnectInitAndPermission([
      { accessType: "write", recordType: "Steps" },
    ]);

  if (!initialized || !grantedPermissions.length) {
    return;
  }

  try {
    await insertRecords([
      {
        recordType: "Steps",
        startTime: "2026-05-19T00:00:00.000Z",
        endTime: "2026-05-19T23:53:15.405Z",
        count: 10000,
      },
      {
        recordType: "Steps",
        startTime: "2026-05-17T00:00:00.000Z",
        endTime: "2026-05-17T23:53:15.405Z",
        count: 8500,
      },
      {
        recordType: "Steps",
        startTime: "2026-05-16T00:00:00.000Z",
        endTime: "2026-05-16T23:53:15.405Z",
        count: 9200,
      },
    ]);
    console.log("Step data inserted successfully");
  } catch (error) {
    console.error("Error inserting step records:", error);
  }
};

export const writeHeartRate = async () => {
  const { initialized, grantedPermissions } =
    await healthConnectInitAndPermission([
      { accessType: "write", recordType: "HeartRate" },
    ]);

  if (!initialized || !grantedPermissions.length) {
    return;
  }

  try {
    await insertRecords([
      {
        recordType: "HeartRate",
        startTime: "2026-05-19T12:00:00.000Z",
        endTime: "2026-05-19T12:01:00.000Z",
        samples: [
          { time: "2026-05-19T12:00:00.000Z", beatsPerMinute: 70 },
          { time: "2026-05-19T12:00:30.000Z", beatsPerMinute: 72 },
          { time: "2026-05-19T12:01:00.000Z", beatsPerMinute: 68 },
        ],
      },
    ]);
    console.log("Heart rate data inserted successfully");
  } catch (error) {
    console.error("Error inserting heart rate records:", error);
  }
};

export const writeSleep = async () => {
  const { initialized, grantedPermissions } =
    await healthConnectInitAndPermission([
      { accessType: "write", recordType: "SleepSession" },
    ]);

  if (!initialized || !grantedPermissions.length) {
    return;
  }

  try {
    await insertRecords([
      {
        recordType: "SleepSession",
        startTime: "2026-05-18T22:00:00.000Z",
        endTime: "2026-05-19T06:00:00.000Z",
        stages: [
          {
            stage: 4,
            startTime: "2026-05-18T22:00:00.000Z",
            endTime: "2026-05-19T00:00:00.000Z",
          },
          {
            stage: 5,
            startTime: "2026-05-19T00:00:00.000Z",
            endTime: "2026-05-19T02:00:00.000Z",
          },
          {
            stage: 6,
            startTime: "2026-05-19T02:00:00.000Z",
            endTime: "2026-05-19T04:00:00.000Z",
          },
          {
            stage: 1,
            startTime: "2026-05-19T04:00:00.000Z",
            endTime: "2026-05-19T06:00:00.000Z",
          },
        ],
      },
    ]);
    console.log("Sleep data inserted successfully");
  } catch (error) {
    console.error("Error inserting sleep records:", error);
  }
};

export const writeActiveCalories = async () => {
  const { initialized, grantedPermissions } =
    await healthConnectInitAndPermission([
      { accessType: "write", recordType: "ActiveCaloriesBurned" },
    ]);

  if (!initialized || !grantedPermissions.length) {
    return;
  }
  try {
    await insertRecords([
      {
        recordType: "ActiveCaloriesBurned",
        startTime: "2026-05-19T00:00:00.000Z",
        endTime: "2026-05-19T23:53:15.405Z",
        energy: { value: 500, unit: "kilocalories" },
      },
    ]);
    console.log("Active calories data inserted successfully");
  } catch (error) {
    console.error("Error inserting active calories records:", error);
  }
};

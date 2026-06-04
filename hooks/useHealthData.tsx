import {
  readActiveCalories,
  readDistance,
  readHeartRate,
  readSleep,
  readSteps,
} from "@/api/healthConnect";
import { HeartRateSample, SleepSession } from "@/constants/types";
import { useEffect, useState } from "react";

export const useHealthData = () => {
  const [steps, setSteps] = useState(0);
  const [activeCalories, setActiveCalories] = useState(0);
  const [heartRate, setHeartRate] = useState<HeartRateSample[]>([]);
  const [sleep, setSleep] = useState<SleepSession[]>([]);
  const [distance, setDistance] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          stepsResult,
          activeCaloriesResult,
          heartRateResult,
          sleepResult,
          distanceResult,
        ] = await Promise.all([
          readSteps(),
          readActiveCalories(),
          readHeartRate(),
          readSleep(),
          readDistance(),
        ]);
        setSteps(stepsResult ?? 0);
        setActiveCalories(activeCaloriesResult ?? 0);
        setHeartRate(heartRateResult ?? []);
        setSleep(
          (sleepResult ?? []).map((record) => ({
            startTime: record.startTime,
            endTime: record.endTime,
            stages: record.stages ?? [],
          })),
        );
        setDistance(distanceResult ?? 0);
      } catch (error: any) {
        setError("Failed to load health data. Please try again later.");
        console.error("Error fetching health data:", error.message);
      }
    };
    fetchData();
  }, []);

  return { steps, activeCalories, heartRate, sleep, distance, error };
};

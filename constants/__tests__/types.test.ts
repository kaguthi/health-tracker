import { formatDay, getGreeting } from "@/constants/types";

describe("getGreeting", () => {
  const realDate = Date;

  afterEach(() => {
    global.Date = realDate;
  });

  function mockHour(hour: number) {
    class MockDate extends realDate {
      constructor() {
        super();
      }
      getHours() {
        return hour;
      }
    }
    // @ts-expect-error - overriding global Date for test isolation
    global.Date = MockDate;
  }

  it("returns 'Good Morning' before noon", () => {
    mockHour(9);
    expect(getGreeting()).toBe("Good Morning");
  });

  it("returns 'Good Morning' at 11:59 (boundary just under 12)", () => {
    mockHour(11);
    expect(getGreeting()).toBe("Good Morning");
  });

  it("returns 'Good Afternoon' at the 12 boundary", () => {
    mockHour(12);
    expect(getGreeting()).toBe("Good Afternoon");
  });

  it("returns 'Good Afternoon' before 6pm", () => {
    mockHour(17);
    expect(getGreeting()).toBe("Good Afternoon");
  });

  it("returns 'Good Evening' at the 18 boundary", () => {
    mockHour(18);
    expect(getGreeting()).toBe("Good Evening");
  });

  it("returns 'Good Evening' late at night", () => {
    mockHour(23);
    expect(getGreeting()).toBe("Good Evening");
  });
});

describe("formatDay", () => {
  it("formats a given date as 'Weekday, Month Day'", () => {
    // 2026-01-06 is a Tuesday
    const date = new Date(2026, 0, 6);
    expect(formatDay(date)).toBe("Tuesday, January 6");
  });

  it("defaults to the current date when no argument is passed", () => {
    const fixed = new Date(2026, 5, 23); // Tuesday, June 23 2026
    jest.useFakeTimers().setSystemTime(fixed);

    expect(formatDay()).toBe("Tuesday, June 23");

    jest.useRealTimers();
  });
});

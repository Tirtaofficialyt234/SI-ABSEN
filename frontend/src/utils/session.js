export const DAY_NAMES = [
  "minggu",
  "senin",
  "selasa",
  "rabu",
  "kamis",
  "jumat",
  "sabtu",
];

export const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function getScheduleTime(schedule, timeField, date) {
  const [hours, minutes, seconds = 0] = schedule[timeField].split(":").map(Number);
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    hours,
    minutes,
    seconds
  );
}

export function findFocusSchedule(schedules, now) {
  const today = DAY_NAMES[now.getDay()];

  return schedules.find((schedule) => {
    if (schedule.hari !== today) {
      return false;
    }

    return (
      now >= getScheduleTime(schedule, "jam_mulai", now) &&
      now <= getScheduleTime(schedule, "jam_selesai", now)
    );
  }) ?? null;
}

export function calculateSessionStatus(schedule, now) {
  if (!schedule) {
    return { status: "no_schedule", remainingSeconds: 0, remainingPercent: 0 };
  }

  const startsAt = getScheduleTime(schedule, "jam_mulai", now);
  const endsAt = getScheduleTime(schedule, "jam_selesai", now);
  const durationSeconds = Math.max(1, (endsAt - startsAt) / 1000);

  if (now < startsAt) {
    return {
      status: "not_started",
      remainingSeconds: Math.ceil((startsAt - now) / 1000),
      remainingPercent: 100,
    };
  }

  if (now > endsAt) {
    return { status: "finished", remainingSeconds: 0, remainingPercent: 0 };
  }

  const remainingSeconds = Math.ceil((endsAt - now) / 1000);

  return {
    status: "active",
    remainingSeconds,
    remainingPercent: Math.max(0, Math.min(100, (remainingSeconds / durationSeconds) * 100)),
  };
}

export function formatRemainingTime(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;

  return [hours, minutes, remainder]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

export function formatIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function trimTime(time) {
  return time.slice(0, 5);
}

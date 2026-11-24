import api from "./axios";

async function getTeacherDashboard() {
  const response = await api.get("/guru/dashboard");
  return response.data;
}

export async function fetchTeacherSchedules() {
  const data = await getTeacherDashboard();

  if (!data.jadwal) {
    return [];
  }

  const schedule = data.jadwal;

  return [
    {
      id: schedule.id,
      kelas_id: schedule.kelas_id,
      mapel_id: schedule.mapel_id,
      hari: schedule.hari,
      jam_mulai: schedule.jam_mulai,
      jam_selesai: schedule.jam_selesai,
      nama_kelas: schedule.kelas.nama_kelas,
      nama_mapel: schedule.mapel.nama_mapel,
    },
  ];
}

export async function fetchClassStudents(classId, scheduleId, date) {
  const data = await getTeacherDashboard();

  if (!data.jadwal) {
    return [];
  }

  if (
    Number(data.jadwal.kelas_id) !== Number(classId) ||
    Number(data.jadwal.id) !== Number(scheduleId)
  ) {
    throw new Error("Jadwal kelas tidak lagi aktif.");
  }

  const students = data.siswa.map((studentClass) => ({
    siswa_kelas_id: studentClass.id,
    nis: studentClass.siswa.nis,
    nama: studentClass.siswa.nama,
    kelas: data.jadwal.kelas.nama_kelas,
    status: "hadir",
    keterangan: "",
  }));

  const attendance = await fetchAttendance(scheduleId, date);
  const statusByStudent = new Map(
    attendance.map((record) => [Number(record.siswa_kelas_id), record.status])
  );

  return students.map((student) => ({
    ...student,
    status: statusByStudent.get(Number(student.siswa_kelas_id)) ?? student.status,
  }));
}

export async function saveAttendance(payload) {
  const response = await api.post("/absensi", payload);
  return response.data;
}

export async function fetchAttendance(scheduleId, date) {
  const response = await api.get("/absensi", {
    params: { jadwal_id: scheduleId, tanggal: date },
  });

  return response.data;
}
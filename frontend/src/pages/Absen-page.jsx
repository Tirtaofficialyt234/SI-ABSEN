import { useContext, useEffect, useMemo, useState } from "react";
import {
  GraduationCap,
  Search,
  Bell,
  CalendarCheck,
  Users,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  XCircle,
  Save,
  Info,
  Lock,
  FileSpreadsheet,
} from "lucide-react";
import ModalRekapAbsensi from "../components/ModalRekapAbsensi";
import CustomSelect from "../components/CustomSelect";
import AuthUserContext from "../auth/AuthUserContext";
import {
  fetchTeacherSchedules,
  fetchClassStudents,
  saveAttendance,
} from "../api/attendanceService";
import {
  DAY_NAMES,
  MONTH_NAMES,
  findFocusSchedule,
  calculateSessionStatus,
  formatRemainingTime,
  formatIsoDate,
  trimTime,
} from "../utils/session";
import "./Absen-page.css";

/* eslint-disable react/prop-types */
const STATUS_OPTIONS = [
  { value: "hadir", label: "Hadir", Icon: CheckCircle2 },
  { value: "izin", label: "Izin", Icon: AlertCircle },
  { value: "sakit", label: "Sakit", Icon: PlusCircle },
  { value: "alpa", label: "Alfa", Icon: XCircle },
];

const STAT_CARDS = [
  { key: "total", label: "Total Siswa", Icon: Users },
  { key: "hadir", label: "Hadir", Icon: CheckCircle2 },
  { key: "izin", label: "Izin", Icon: AlertCircle },
  { key: "sakit", label: "Sakit", Icon: PlusCircle },
  { key: "alpa", label: "Alfa", Icon: XCircle },
];

const SESSION_LABELS = {
  active: "Sesi Aktif",
  not_started: "Belum Dimulai",
  finished: "Sesi Selesai",
  no_schedule: "Tidak Ada Jadwal",
};

const SESSION_INFO = {
  active: {
    title: "Absensi dibuka untuk jam ini",
    description: "Silakan isi kehadiran siswa.",
    Icon: Clock,
  },
  not_started: {
    title: "Absensi belum dimulai",
    description: "Absensi terbuka saat jam pelajaran dimulai.",
    Icon: Lock,
  },
  finished: {
    title: "Sesi pelajaran telah berakhir",
    description: "Absensi dikunci dan tidak bisa diubah.",
    Icon: Lock,
  },
  no_schedule: {
    title: "Tidak ada jadwal",
    description: "Tidak ada jam pelajaran untuk pilihan ini hari ini.",
    Icon: Lock,
  },
};

const SAVE_BUTTON_LABELS = {
  idle: "Simpan Absensi",
  saving: "Menyimpan...",
  saved: "Absensi Tersimpan",
  failed: "Gagal, coba lagi",
};


//digunakan untuk mengambil opsi unik dari daftar jadwal berdasarkan kunci id dan nama.
function getUniqueOptions(list, idKey, nameKey) {
  const seenIds = new Set();
  const options = [];
  list.forEach((item) => {
    if (!seenIds.has(item[idKey])) {
      seenIds.add(item[idKey]);
      options.push({ id: item[idKey], name: item[nameKey] });
    }
  });
  return options;
}


//digunakan untuk mengambil inisial dari nama siswa.
function getInitials(name) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

//digunakan untuk memilih kelas atau mata pelajaran.
function FilterSelect({ label, Icon, value, options, onChange }) {
  return (
    <div className="filter-group">
      <span className="filter-icon">
        <Icon size={22} />
      </span>
      <span className="filter-body">
        <small>{label}</small>
        <CustomSelect
          ariaLabel={label}
          icon={null}
          value={value ?? ""}
          options={options.map((option) => ({
            value: option.id,
            label: option.name,
          }))}
          placeholder={`Pilih ${label.toLowerCase()}...`}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </span>
    </div>
  );
}

//digunakan untuk membuat kartu statistik yang menampilkan jumlah siswa berdasarkan status kehadiran.
function StatCard({ label, value, Icon, statKey }) {
  return (
    <div className="stat-card">
      <span className={`stat-icon stat-icon-${statKey}`}>
        <Icon size={26} />
      </span>
      <div className="stat-body">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}


//digunakan untuk membuat baris tabel yang menampilkan informasi siswa, status kehadiran, dan keterangan.
function StudentRow({ number, student, isLocked, onStatusChange, onNoteChange }) {
  return (
    <tr>
      <td className="cell-center">{number}</td>
      <td className="cell-center">{student.nis}</td>
      <td>
        <div className="cell-student">
          <span className="student-avatar">{getInitials(student.nama)}</span>
          <span>{student.nama}</span>
        </div>
      </td>
      <td className="cell-center">{student.kelas}</td>
      <td>
        <div className="status-options" role="group" aria-label={`Status ${student.nama}`}>
          {STATUS_OPTIONS.map(({ value, label, Icon }) => {
            const isSelected = student.status === value;

            return (
              <button
                key={value}
                type="button"
                className={`status-option status-option-${value}${isSelected ? " status-option-selected" : ""}`}
                aria-pressed={isSelected}
                disabled={isLocked}
                onClick={() => onStatusChange(student.siswa_kelas_id, value)}
              >
                <Icon size={14} aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>
      </td>
      <td>
        <input
          type="text"
          className="note-input"
          placeholder="Tambah keterangan"
          value={student.keterangan}
          disabled={isLocked}
          onChange={(event) => onNoteChange(student.siswa_kelas_id, event.target.value)}
        />
      </td>
    </tr>
  );
}

//digunakan untuk membuat halaman absensi yang menampilkan jadwal, daftar siswa, dan fitur pengisian absensi.
export default function Absensi() {
  const user = useContext(AuthUserContext);
  const [schedules, setSchedules] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [classId, setClassId] = useState(null);
  const [subjectId, setSubjectId] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [isRekapOpen, setIsRekapOpen] = useState(false);
  const [tick, setTick] = useState(() => Date.now());

  const now = new Date(tick);
  const today = DAY_NAMES[now.getDay()];
  const attendanceDate = formatIsoDate(now);

  useEffect(() => {
    const intervalId = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    fetchTeacherSchedules()
      .then((data) => {
        if (!isCancelled) {
          setSchedules(data);
        }
      })
      .catch((error) => {
        if (isCancelled) return;

        setLoadError(
          error.response?.status === 403
            ? "Data absensi pengisian hanya tersedia untuk guru."
            : "Gagal memuat jadwal mengajar. Silakan coba lagi."
        );
      });

    return () => {
      isCancelled = true;
    };
  }, []);


//digunakan untuk menemukan jadwal fokus berdasarkan waktu saat ini.
  const focusSchedule = findFocusSchedule(schedules, now);
  const focusId = focusSchedule ? focusSchedule.id : null;

  useEffect(() => {
    if (schedules.length === 0) return;
    const target = schedules.find((schedule) => schedule.id === focusId) || schedules[0];
    setClassId(target.kelas_id);
    setSubjectId(target.mapel_id);
  }, [focusId, schedules]);

  const selectedSchedule =
    schedules.find(
      (schedule) => schedule.kelas_id === classId && schedule.mapel_id === subjectId
    ) ||
    null;

//digunakan untuk mengambil id jadwal yang dipilih berdasarkan kelas dan mata pelajaran yang dipilih.
  const scheduleId = selectedSchedule ? selectedSchedule.id : null;

  useEffect(() => {
    if (classId === null || scheduleId === null) return;
    let isCancelled = false;
    setIsLoadingStudents(true);

    fetchClassStudents(classId, scheduleId, attendanceDate)
      .then((data) => {
        if (isCancelled) return;

        setStudents(data);
        setLoadError("");
        setSaveStatus("idle");
      })
      .catch((error) => {
        if (isCancelled) return;

        setStudents([]);
        setLoadError(
          error.response?.status === 403
            ? "Data absensi pengisian hanya tersedia untuk guru."
            : "Gagal memuat daftar siswa. Silakan coba lagi."
        );
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingStudents(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [classId, scheduleId, attendanceDate]);

  const session = calculateSessionStatus(selectedSchedule, now);
  const isAttendanceOpen = session.status === "active";

  const classOptions = getUniqueOptions(schedules, "kelas_id", "nama_kelas");
  const subjectOptions = getUniqueOptions(
    schedules.filter((schedule) => schedule.kelas_id === classId),
    "mapel_id",
    "nama_mapel"
  );

  const statusCounts = useMemo(
    () =>
      students.reduce(
        (counts, student) => {
          counts[student.status] += 1;
          return counts;
        },
        { hadir: 0, izin: 0, sakit: 0, alpa: 0 }
      ),
    [students]
  );
  const cardValues = { total: students.length, ...statusCounts };

  const visibleStudents = students.filter((student) =>
    student.nama.toLowerCase().includes(searchKeyword.trim().toLowerCase())
  );

  function handleClassChange(newClassId) {
    const firstSchedule = schedules.find((schedule) => schedule.kelas_id === newClassId);
    if (!firstSchedule) return;

    setClassId(newClassId);
    setSubjectId(firstSchedule.mapel_id);
  }

  function handleStatusChange(studentClassId, newStatus) {
    setStudents((previous) =>
      previous.map((student) =>
        student.siswa_kelas_id === studentClassId ? { ...student, status: newStatus } : student
      )
    );
    setSaveStatus("idle");
  }

  function handleNoteChange(studentClassId, text) {
    setStudents((previous) =>
      previous.map((student) =>
        student.siswa_kelas_id === studentClassId ? { ...student, keterangan: text } : student
      )
    );
    setSaveStatus("idle");
  }

  function handleMarkAllPresent() {
    setStudents((previous) =>
      previous.map((student) => ({ ...student, status: "hadir", keterangan: "" }))
    );
    setSaveStatus("idle");
  }

  async function handleSave() {
    if (!isAttendanceOpen || !selectedSchedule) return;

    const payload = {
      jadwal_id: selectedSchedule.id,
      tanggal: attendanceDate,
      data: students.map((student) => ({
        siswa_kelas_id: student.siswa_kelas_id,
        status: student.status,
      })),
    };

    setSaveStatus("saving");
    try {
      await saveAttendance(payload);
      setSaveStatus("saved");
    } catch {
      setSaveStatus("failed");
    }
  }

  const sessionInfo = SESSION_INFO[session.status];
  const SessionInfoIcon = sessionInfo.Icon;

  const dateText = `${today}, ${now.getDate()} ${MONTH_NAMES[now.getMonth()]} ${now.getFullYear()}`;
  const lessonTimeText =
    session.status !== "no_schedule"
      ? `Jam pelajaran • ${trimTime(selectedSchedule.jam_mulai)} - ${trimTime(selectedSchedule.jam_selesai)}`
      : "Tidak ada jam pelajaran";

  let deadlineText = "Pilih kelas dan mata pelajaran yang memiliki jadwal hari ini.";
  let remainingLabel = "Sisa Waktu";
  let remainingValue = "-";

  if (session.status === "active") {
    deadlineText = `Pastikan mengisi absensi sebelum sesi berakhir (${trimTime(selectedSchedule.jam_selesai)}).`;
    remainingValue = formatRemainingTime(session.remainingSeconds);
  } else if (session.status === "not_started") {
    deadlineText = `Absensi dapat diisi mulai pukul ${trimTime(selectedSchedule.jam_mulai)}.`;
    remainingLabel = "Mulai Dalam";
    remainingValue = formatRemainingTime(session.remainingSeconds);
  } else if (session.status === "finished") {
    deadlineText = "Batas waktu pengisian absensi telah lewat.";
  }

  return (
    <div className="attendance-page">
      <header className="page-header">
        <div className="brand">
          <div className="brand-logo">
            <GraduationCap size={24} />
          </div>
          <div className="brand-text">
            <strong>SI-ABSEN</strong>
            <span>Sistem Absensi Sekolah</span>
          </div>
        </div>

        <label className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Cari nama siswa..."
            value={searchKeyword}
            onChange={(event) => setSearchKeyword(event.target.value)}
          />
        </label>

        <div className="header-right">
          <div className="notification-wrapper">
            <button
              type="button"
              className="notification-button"
              aria-label="Notifikasi"
              onClick={() => setIsNotificationOpen((isOpen) => !isOpen)}
            >
              <Bell size={20} />
              <span className="notification-dot" />
            </button>
            {isNotificationOpen && (
              <div className="notification-popup">Belum ada notifikasi baru.</div>
            )}
          </div>
          <div className="teacher-profile">
            <div className="teacher-avatar">{(user.name || user.email || "U").charAt(0)}</div>
            <div className="teacher-text">
              <strong>{user.name || user.email}</strong>
              <span>{user.role}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="content">
        <section className="title-row">
          <div className="title-left">
            <div className="title-icon">
              <CalendarCheck size={34} />
            </div>
            <div>
              <h1>Absensi Siswa</h1>
              <p>Kelola kehadiran siswa berdasarkan jadwal pelajaran.</p>
            </div>
          </div>

          <div className="date-card">
            <CalendarCheck size={28} className="date-icon" />
            <div className="date-text">
              <strong>{dateText}</strong>
              <span>{lessonTimeText}</span>
            </div>
            <span className={`session-pill session-pill-${session.status}`}>
              <i className="session-dot" />
              {SESSION_LABELS[session.status]}
            </span>
          </div>
        </section>

        {loadError && (
          <p className="attendance-error" role="alert">
            {loadError}
          </p>
        )}

        <section className="filter-row">
          <FilterSelect
            label="Kelas"
            Icon={GraduationCap}
            value={classId}
            options={classOptions}
            onChange={handleClassChange}
          />
          <FilterSelect
            label="Mata Pelajaran"
            Icon={BookOpen}
            value={subjectId}
            options={subjectOptions}
            onChange={setSubjectId}
          />

          <div className={`session-banner ${isAttendanceOpen ? "banner-open" : "banner-locked"}`}>
            <SessionInfoIcon size={34} />
            <div>
              <strong>{sessionInfo.title}</strong>
              <span>{sessionInfo.description}</span>
            </div>
          </div>
        </section>

        <section className="stats-grid">
          {STAT_CARDS.map((card) => (
            <StatCard
              key={card.key}
              statKey={card.key}
              label={card.label}
              Icon={card.Icon}
              value={cardValues[card.key]}
            />
          ))}
        </section>

        <section className="table-card">
          <div className="table-header">
            <div className="table-title">
              <Users size={26} className="table-icon" />
              <div>
                <h2>Daftar Siswa</h2>
                <p>Pilih status kehadiran untuk setiap siswa.</p>
              </div>
            </div>
            <div className="table-actions">
              <button
                type="button"
                className="button-rekap"
                onClick={() => setIsRekapOpen(true)}
              >
                <FileSpreadsheet size={16} />
                Rekap & Cetak PDF
              </button>
              <button
                type="button"
                className="button-outline"
                disabled={!isAttendanceOpen || students.length === 0}
                onClick={handleMarkAllPresent}
              >
                <CheckCircle2 size={18} />
                Tandai Semua Hadir
              </button>
              <button
                type="button"
                className="button-primary"
                disabled={!isAttendanceOpen || saveStatus === "saving" || students.length === 0}
                onClick={handleSave}
              >
                <Save size={18} />
                {SAVE_BUTTON_LABELS[saveStatus]}
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>No</th>
                  <th>NIS</th>
                  <th>Nama Siswa</th>
                  <th>Kelas</th>
                  <th>Status Kehadiran</th>
                  <th>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingStudents && (
                  <tr>
                    <td colSpan={6} className="cell-empty">
                      Memuat daftar siswa...
                    </td>
                  </tr>
                )}
                {!isLoadingStudents && visibleStudents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="cell-empty">
                      Siswa tidak ditemukan.
                    </td>
                  </tr>
                )}
                {!isLoadingStudents &&
                  visibleStudents.map((student, index) => (
                    <StudentRow
                      key={student.siswa_kelas_id}
                      number={index + 1}
                      student={student}
                      isLocked={!isAttendanceOpen}
                      onStatusChange={handleStatusChange}
                      onNoteChange={handleNoteChange}
                    />
                  ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="session-footer">
          <div className="footer-info">
            <Info size={20} />
            <span>{deadlineText}</span>
          </div>
          <div className="remaining-time">
            <Clock size={26} />
            <div className="remaining-text">
              <small>{remainingLabel}</small>
              <strong>{remainingValue}</strong>
            </div>
            <div className="progress">
              <div className="progress-fill" style={{ width: `${session.remainingPercent}%` }} />
            </div>
          </div>
        </footer>
      </main>

      <ModalRekapAbsensi
        isOpen={isRekapOpen}
        onClose={() => setIsRekapOpen(false)}
        selectedSchedule={selectedSchedule}
        guruId={user?.guru?.id}
      />
    </div>
  );
}
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  Check,
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  School,
  Search,
  Users,
} from "lucide-react";
import api from "../api/axios";

/* eslint-disable react/prop-types */
const ADMIN_PAGES = [
  { label: "Dashboard", path: "/dashboard", Icon: LayoutDashboard },
  { label: "Data Siswa", path: "/siswa", Icon: Users },
  { label: "Data Guru", path: "/guru", Icon: GraduationCap },
  { label: "Data Kelas", path: "/kelas", Icon: School },
  { label: "Jadwal", path: "/jadwal", Icon: CalendarCheck },
  { label: "Tahun Ajaran", path: "/tahun-ajaran", Icon: CalendarDays },
  { label: "Mata Pelajaran", path: "/mapel", Icon: BookOpen },
];

export default function AdminTopbar({
  isSidebarOpen,
  onToggleSidebar,
  onLogout,
  onNotificationClick,
  searchPlaceholder,
  notificationItems,
}) {
  const navigate = useNavigate();
  const [openPopover, setOpenPopover] = useState(null);
  const [notifications, setNotifications] = useState(notificationItems ?? []);
  const [readNotificationIds, setReadNotificationIds] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(
    notificationItems === undefined
  );
  const [notificationError, setNotificationError] = useState("");
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    if (notificationItems !== undefined) {
      setNotifications(notificationItems);
      setNotificationError("");
      setIsLoadingNotifications(false);
      return;
    }

    let isActive = true;

    api.get("/admin/dashboard")
      .then(({ data }) => {
        if (!Array.isArray(data.absensi_terbaru)) {
          throw new Error("Data notifikasi tidak valid.");
        }

        if (isActive) {
          setNotifications(data.absensi_terbaru);
          setNotificationError("");
        }
      })
      .catch((error) => {
        if (!isActive) {
          return;
        }

        console.error("Gagal memuat notifikasi admin:", error);
        setNotificationError("Notifikasi gagal dimuat. Silakan coba lagi.");
      })
      .finally(() => {
        if (isActive) {
          setIsLoadingNotifications(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [notificationItems]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      const isInsideNotification = notificationRef.current?.contains(event.target);
      const isInsideProfile = profileRef.current?.contains(event.target);

      if (!isInsideNotification && !isInsideProfile) {
        setOpenPopover(null);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpenPopover(null);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const unreadNotificationCount = notifications.filter(
    (item) => !readNotificationIds.includes(item.id)
  ).length;

  const markAllNotificationsAsRead = () => {
    setReadNotificationIds((currentIds) => [
      ...new Set([...currentIds, ...notifications.map((item) => item.id)]),
    ]);
  };

  const handleNotificationClick = (notificationId) => {
    setReadNotificationIds((currentIds) => [
      ...new Set([...currentIds, notificationId]),
    ]);
    setOpenPopover(null);

    if (onNotificationClick) {
      onNotificationClick(notificationId);
    }
  };

  const handlePageNavigation = (path) => {
    setOpenPopover(null);
    navigate(path);
  };

  return (
    <header className="topbar">
      <div className="topbar-leading">
        <button
          type="button"
          className="menu-btn"
          aria-label={isSidebarOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={isSidebarOpen}
          onClick={onToggleSidebar}
        >
          <Menu size={24} />
        </button>

        <label className="search-box">
          <Search size={19} aria-hidden="true" />
          <input type="search" placeholder={searchPlaceholder} />
        </label>
      </div>

      <div className="topbar-right">
        <div className="topbar-popover" ref={notificationRef}>
          <button
            type="button"
            className="admin-notification-trigger"
            aria-label={`Notifikasi, ${unreadNotificationCount} belum dibaca`}
            aria-expanded={openPopover === "notifications"}
            aria-haspopup="dialog"
            onClick={() => setOpenPopover((current) =>
              current === "notifications" ? null : "notifications"
            )}
          >
            <Bell size={21} />
            {unreadNotificationCount > 0 && (
              <span className="notification-count">{unreadNotificationCount}</span>
            )}
          </button>

          {openPopover === "notifications" && (
            <div
              className="admin-popover notification-menu"
              role="dialog"
              aria-label="Notifikasi absensi terbaru"
            >
              <div className="popover-heading">
                <div>
                  <strong>Notifikasi</strong>
                  <span>{notifications.length} absensi terbaru</span>
                </div>
                <button
                  type="button"
                  className="mark-read-button"
                  disabled={unreadNotificationCount === 0}
                  onClick={markAllNotificationsAsRead}
                >
                  <Check size={15} />
                  Tandai dibaca
                </button>
              </div>

              {isLoadingNotifications ? (
                <p className="popover-empty" role="status">
                  Memuat notifikasi...
                </p>
              ) : notificationError ? (
                <p className="popover-empty" role="alert">
                  {notificationError}
                </p>
              ) : notifications.length === 0 ? (
                <p className="popover-empty">Belum ada absensi terbaru.</p>
              ) : (
                <div className="notification-list">
                  {notifications.map((item) => {
                    const isUnread = !readNotificationIds.includes(item.id);

                    return (
                      <button
                        type="button"
                        key={item.id}
                        className={`notification-item${isUnread ? " unread" : ""}`}
                        onClick={() => handleNotificationClick(item.id)}
                      >
                        <span className="notification-item-copy">
                          <strong>Absensi {item.status} dicatat</strong>
                          <span>{item.nama_siswa} · {item.nama_kelas}</span>
                          <time>{item.tanggal}</time>
                        </span>
                        {isUnread && (
                          <span
                            className="notification-unread-dot"
                            aria-label="Belum dibaca"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="topbar-popover" ref={profileRef}>
          <button
            type="button"
            className="profile profile-trigger"
            aria-label="Menu profil admin"
            aria-expanded={openPopover === "profile"}
            aria-haspopup="menu"
            onClick={() => setOpenPopover((current) =>
              current === "profile" ? null : "profile"
            )}
          >
            <span className="profile-avatar">A</span>
            <span className="profile-name">Admin</span>
            <ChevronDown size={17} />
          </button>

          {openPopover === "profile" && (
            <div className="admin-popover profile-menu" role="menu" aria-label="Menu admin">
              <div className="profile-menu-heading">
                <span className="profile-avatar">A</span>
                <span>
                  <strong>Administrator</strong>
                  <small>Admin</small>
                </span>
              </div>
              {ADMIN_PAGES.map(({ label, path, Icon }) => (
                <button
                  type="button"
                  role="menuitem"
                  key={path}
                  onClick={() => handlePageNavigation(path)}
                >
                  <Icon size={17} />
                  {label}
                </button>
              ))}
              <button
                type="button"
                role="menuitem"
                className="profile-logout"
                onClick={onLogout}
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


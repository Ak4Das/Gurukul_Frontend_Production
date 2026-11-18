import { useEffect, useState } from "react"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboard,
  BarChart3,
  UserPlus,
  GraduationCap,
  School,
  Users,
  Package,
  Boxes,
  BookOpen,
  UserCog,
  UserCheck,
  ClipboardList,
  FileBadge,
  ShieldAlert,
  Award,
  Trophy,
  Wallet,
  Receipt,
  Landmark,
  LifeBuoy,
  MessageSquareWarning,
  FolderOpen,
  UsersRound,
  CircleUser,
  Settings,
  Info,
  Megaphone,
  CalendarDays,
  CalendarRange,
  NotebookPen,
  BookMarked,
  LogOut,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Building2,
  Library,
  BadgeIndianRupee,
  Search,
} from "lucide-react"
import { useApp } from "../context/AppContext"
import { api } from "../api"
import CommandPalette from "./CommandPalette"

const NAV = [
  {
    section: "Overview",
    items: [
      {
        to: "/",
        label: "Dashboard",
        icon: LayoutDashboard,
        roles: ["admin", "clerk", "supervisor", "teacher"],
      },
      {
        to: "/portal",
        label: "My Dashboard",
        icon: LayoutDashboard,
        roles: ["student", "parent"],
      },
      {
        to: "/reports",
        label: "Reports",
        icon: BarChart3,
        roles: ["admin", "clerk", "supervisor"],
      },
    ],
  },
  {
    section: "Records",
    items: [
      {
        to: "/admissions",
        label: "Admissions",
        icon: UserPlus,
        roles: ["admin", "clerk", "supervisor"],
      },
      {
        to: "/students",
        label: "Students",
        icon: GraduationCap,
        roles: ["admin", "clerk", "supervisor", "teacher"],
      },
      {
        to: "/classes",
        label: "Classes & Sections",
        icon: School,
        roles: ["admin", "clerk", "supervisor"],
      },
      {
        to: "/parents",
        label: "Parents",
        icon: UsersRound,
        roles: ["admin", "clerk", "supervisor"],
      },
      {
        to: "/assets",
        label: "Assets",
        icon: Package,
        roles: ["admin", "clerk", "supervisor"],
      },
      {
        to: "/inventory",
        label: "Stock / Inventory",
        icon: Boxes,
        roles: ["admin", "clerk", "supervisor"],
      },
      {
        to: "/subjects",
        label: "Subjects",
        icon: BookOpen,
        roles: ["admin", "clerk", "supervisor"],
      },
      {
        to: "/teachers",
        label: "Teachers",
        icon: UserCog,
        roles: ["admin", "clerk", "supervisor"],
      },
      {
        to: "/substitutes",
        label: "Substitutes",
        icon: RefreshCw,
        roles: ["admin", "clerk", "supervisor"],
      },
    ],
  },
  {
    section: "Library",
    items: [
      {
        to: "/library",
        label: "Books Catalog",
        icon: Library,
        roles: ["admin", "clerk", "supervisor", "teacher", "student", "parent"],
      },
      {
        to: "/library-circulation",
        label: "Issue / Return",
        icon: BookMarked,
        roles: ["admin", "clerk", "supervisor", "teacher"],
      },
    ],
  },
  {
    section: "Daily",
    items: [
      {
        to: "/timetable",
        label: "Timetable",
        icon: CalendarRange,
        roles: ["admin", "clerk", "supervisor", "teacher", "student", "parent"],
      },
      {
        to: "/attendance",
        label: "Attendance",
        icon: UserCheck,
        roles: ["admin", "clerk", "supervisor", "teacher"],
      },
      {
        to: "/notices",
        label: "School Notices",
        icon: Megaphone,
        roles: ["admin", "clerk", "supervisor", "teacher", "student", "parent"],
      },
      {
        to: "/ptm",
        label: "PTM",
        icon: UsersRound,
        roles: ["admin", "clerk", "supervisor", "teacher", "parent"],
      },
      {
        to: "/calendar",
        label: "Calendar",
        icon: CalendarDays,
        roles: ["admin", "clerk", "supervisor", "teacher", "student", "parent"],
      },
      {
        to: "/lesson-planning",
        label: "Lesson Planning",
        icon: NotebookPen,
        roles: ["admin", "supervisor", "teacher"],
      },
      {
        to: "/logbook",
        label: "Teaching Logbook",
        icon: BookMarked,
        roles: ["admin", "supervisor", "teacher"],
      },
    ],
  },
  {
    section: "Academic",
    items: [
      {
        to: "/exams",
        label: "Exams",
        icon: ClipboardList,
        roles: ["admin", "clerk", "supervisor", "teacher"],
      },
      {
        to: "/marks",
        label: "Results / Marks",
        icon: Award,
        roles: ["admin", "clerk", "supervisor", "teacher"],
      },
      {
        to: "/hall-tickets",
        label: "Hall Tickets",
        icon: FileBadge,
        roles: ["admin", "clerk", "supervisor", "student", "parent"],
      },
      {
        to: "/discipline",
        label: "Discipline",
        icon: ShieldAlert,
        roles: ["admin", "clerk", "supervisor", "teacher"],
        badgeKey: "openIncidents",
      },
      {
        to: "/conduct",
        label: "Conduct",
        icon: Award,
        roles: ["admin", "clerk", "supervisor", "teacher"],
      },
      {
        to: "/activities",
        label: "Activities",
        icon: Trophy,
        roles: ["admin", "clerk", "supervisor", "teacher"],
      },
    ],
  },
  {
    section: "Finance",
    items: [
      {
        to: "/fees",
        label: "Fees Collection",
        icon: Wallet,
        roles: ["admin", "clerk", "supervisor"],
      },
      {
        to: "/payroll",
        label: "Payroll / Salary",
        icon: BadgeIndianRupee,
        roles: ["admin", "clerk", "supervisor", "teacher"],
      },
      {
        to: "/daily-accounts",
        label: "Daily Accounts",
        icon: Landmark,
        roles: ["admin", "clerk", "supervisor"],
      },
      {
        to: "/fee-structure",
        label: "Fee Structure",
        icon: Receipt,
        roles: ["admin", "clerk", "supervisor"],
      },
    ],
  },
  {
    section: "Support",
    items: [
      {
        to: "/helpdesk",
        label: "Helpdesk",
        icon: LifeBuoy,
        roles: ["admin", "clerk", "supervisor", "teacher", "student", "parent"],
        badgeKey: "openTickets",
      },
      {
        to: "/complaints",
        label: "Complaints",
        icon: MessageSquareWarning,
        roles: ["admin", "clerk", "supervisor", "teacher", "student", "parent"],
        badgeKey: "openComplaints",
      },
      {
        to: "/documents",
        label: "Documents",
        icon: FolderOpen,
        roles: ["admin", "clerk", "supervisor", "teacher", "student", "parent"],
      },
    ],
  },
  {
    section: "Administration",
    items: [
      {
        to: "/users",
        label: "Users / Staff",
        icon: Users,
        roles: ["admin", "clerk", "supervisor"],
      },
    ],
  },
  {
    section: "Profile",
    items: [
      {
        to: "/account",
        label: "My Account",
        icon: CircleUser,
        roles: ["admin", "clerk", "supervisor", "teacher", "student", "parent"],
      },
      { to: "/settings", label: "Settings", icon: Settings, roles: ["admin"] },
      {
        to: "/about",
        label: "About App",
        icon: Info,
        roles: ["admin", "clerk", "supervisor", "teacher", "student", "parent"],
      },
    ],
  },
]

const TITLES = {
  "/": "Dashboard",
  "/portal": "My Dashboard",
  "/reports": "Reports",
  "/admissions": "Admissions Management",
  "/students": "Students Management",
  "/classes": "Classes & Sections",
  "/parents": "Parents Management",
  "/assets": "Assets Management",
  "/inventory": "Stock / Inventory",
  "/subjects": "Subjects Management",
  "/teachers": "Teachers Management",
  "/substitutes": "Substitute Management",
  "/timetable": "Timetable",
  "/attendance": "Attendance",
  "/notices": "School Notices",
  "/ptm": "Parent-Teacher Meetings",
  "/calendar": "School Calendar",
  "/lesson-planning": "Lesson Planning",
  "/logbook": "Teaching Logbook",
  "/exams": "Exams Management",
  "/marks": "Results / Marks Entry",
  "/hall-tickets": "Hall Tickets",
  "/discipline": "Discipline Management",
  "/conduct": "Conduct Register",
  "/activities": "Activities",
  "/fees": "Fees Collection",
  "/daily-accounts": "Daily Accounts",
  "/fee-structure": "Fee Structure",
  "/helpdesk": "Helpdesk",
  "/complaints": "Complaints Management",
  "/documents": "Documents",
  "/users": "Users Management",
  "/account": "My Account",
  "/settings": "Settings",
  "/about": "About App",
  "/library": "Library — Books Catalog",
  "/library-circulation": "Library — Issue / Return",
  "/payroll": "Payroll / Salary Slips",
}

export default function Layout() {
  const { user, logout, settings } = useApp()
  const [collapsed, setCollapsed] = useState(false)
  const [dark, setDark] = useState(
    () => localStorage.getItem("sms_theme") === "dark",
  )
  const [badges, setBadges] = useState({})
  const [cmdOpen, setCmdOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!["admin", "clerk", "supervisor", "teacher"].includes(user?.role))
      return
    api
      .get("/dashboard/stats")
      .then(({ data }) =>
        setBadges({
          openIncidents: data.openIncidents,
          openTickets: data.openTickets,
          openComplaints: data.openComplaints,
        }),
      )
      .catch(() => {})
  }, [location.pathname, user])

  // Proper dark mode: toggles a class + persists; CSS variables handle the rest
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    localStorage.setItem("sms_theme", dark ? "dark" : "light")
  }, [dark])

  // Ctrl+K opens the global command palette
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setCmdOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const title = TITLES[location.pathname] || "Dashboard"
  const canSearch = ["admin", "clerk", "supervisor", "teacher"].includes(
    user?.role,
  )

  return (
    <div className={`app-shell ${collapsed ? "collapsed" : ""}`}>
      <aside className="sidebar">
        <div className="sidebar-head">
          <Building2 size={20} />
          <span className="nav-label">
            {settings.schoolName || "Demo School"}
          </span>
          <button
            className="collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>
        <div className="school-block">
          <div className="school-icon">
            <GraduationCap size={42} />
          </div>
          <div className="uname">{user?.fullName}</div>
          <div className="urole">{user?.role}</div>
        </div>
        <nav className="sidebar-nav">
          {NAV.map((sec) => {
            const items = sec.items.filter((i) => i.roles.includes(user?.role))
            if (!items.length) return null
            return (
              <div key={sec.section}>
                <div className="nav-section">{sec.section}</div>
                {items.map((i) => (
                  <NavLink
                    key={i.to}
                    to={i.to}
                    className={({ isActive }) =>
                      `nav-item ${isActive ? "active" : ""}`
                    }
                    end={i.to === "/"}
                  >
                    <i.icon size={16} />
                    <span className="nav-label">{i.label}</span>
                    {i.badgeKey && badges[i.badgeKey] > 0 && (
                      <span className="nav-badge">{badges[i.badgeKey]}</span>
                    )}
                  </NavLink>
                ))}
              </div>
            )
          })}
        </nav>
        <div className="sidebar-foot">
          <button onClick={() => setDark(!dark)}>
            {dark ? <Sun size={14} /> : <Moon size={14} />}{" "}
            <span className="nav-label">
              {dark ? "Light Mode" : "Dark Mode"}
            </span>
          </button>
          <button
            className="logout-btn"
            onClick={() => {
              logout()
              navigate("/home")
            }}
          >
            <LogOut size={14} /> <span className="nav-label">Logout</span>
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar no-print">
          <div className="page-title">{title}</div>
          <div className="spacer" />
          {canSearch && (
            <button className="search-trigger" onClick={() => setCmdOpen(true)}>
              <Search size={14} /> Search everything…
              <span className="kbd">Ctrl K</span>
            </button>
          )}
          <div className="top-right">
            <span>
              <Building2 size={14} style={{ verticalAlign: "-2px" }} />{" "}
              {settings.schoolName}
            </span>
            <span>
              Welcome, <b>{user?.fullName}</b>
            </span>
            <button
              className="icon-btn"
              title="Refresh"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  )
}

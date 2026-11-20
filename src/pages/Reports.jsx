import { useEffect, useState } from "react"
import {
  BarChart3,
  GraduationCap,
  Wallet,
  UserCheck,
  ShieldAlert,
  School,
  UsersRound,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { api } from "../api"
import { useApp } from "../context/AppContext"
import { InfoCard } from "../components/ui"

export default function Reports() {
  const [stats, setStats] = useState(null)
  const { settings } = useApp()
  const navigate = useNavigate()
  const cur = settings.currency || "₹"

  useEffect(() => {
    api.get("/dashboard/stats").then(({ data }) => setStats(data))
  }, [])
  if (!stats) return <div className="card card-pad">Loading reports…</div>

  const reports = [
    {
      title: "Students Report",
      desc: "Full student roster with filters — export CSV/PDF from the Students page.",
      icon: GraduationCap,
      to: "/students",
      color: "navy",
      stat: `${stats.activeStudents} active`,
    },
    {
      title: "Fee Collection Report",
      desc: "All receipts with paid/partial/unpaid breakdown.",
      icon: Wallet,
      to: "/fees",
      color: "green",
      stat: `${cur}${stats.todaysCollection.toLocaleString()} today`,
    },
    {
      title: "Outstanding Dues",
      desc: "Students with pending balances.",
      icon: Wallet,
      to: "/fees?tab=partial",
      color: "red",
      stat: `${cur}${stats.outstanding.toLocaleString()} outstanding`,
    },
    {
      title: "Attendance Report",
      desc: "Per-student and per-class attendance summaries.",
      icon: UserCheck,
      to: "/attendance",
      color: "orange",
      stat: `${stats.attendanceToday.present}/${stats.attendanceToday.marked} today`,
    },
    {
      title: "Class Reports",
      desc: "Class-wise strength, capacity, timetable exports.",
      icon: School,
      to: "/classes",
      color: "teal",
      stat: `${stats.classes} classes`,
    },
    {
      title: "Discipline Report",
      desc: "Incidents by severity with action logs.",
      icon: ShieldAlert,
      to: "/discipline",
      color: "red",
      stat: `${stats.openIncidents} open`,
    },
    {
      title: "Daily Accounts",
      desc: "Daily income vs expense ledger.",
      icon: Wallet,
      to: "/daily-accounts",
      color: "purple",
      stat: "Income / Expense",
    },
    {
      title: "Parents Report",
      desc: "Parent contacts with linked children.",
      icon: UsersRound,
      to: "/parents",
      color: "pink",
      stat: `${stats.parents} parents`,
    },
  ]

  return (
    <>
      <div className="page-head">
        <h2>
          <BarChart3 size={20} /> Reports
        </h2>
      </div>
      <p className="small muted mb">
        Every table in the app has CSV / PDF / Print export built in. Use these
        shortcuts to jump to the report you need.
      </p>
      <div className="kpi-grid">
        {reports.map((r) => (
          <InfoCard
            key={r.title}
            color={r.color}
            icon={r.icon}
            value={r.stat}
            label={r.title}
            onClick={() => navigate(r.to)}
          />
        ))}
      </div>
      <div className="card card-pad">
        <div className="card-title">How exports work</div>
        <p className="small muted">
          Open any module → apply filters / status tabs → click <b>CSV</b>{" "}
          (spreadsheet), <b>PDF</b> or <b>PRINT</b> above the table. The export
          respects your current filters and search.
        </p>
      </div>
    </>
  )
}

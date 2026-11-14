import { useMemo, useState } from "react"
import {
  X,
  FileText,
  Printer,
  FileSpreadsheet,
  Search,
  Filter as FilterIcon,
  XCircle,
  KeyRound,
  Copy,
  ArrowUpDown,
  MoveUp,
  MoveDown,
} from "lucide-react"

//! Info card component
export function InfoCard({
  color = "navy",
  icon: Icon,
  value,
  label,
  onAction,
  actionLabel,
  onClick,
}) {
  return (
    <div
      className={`kpi-card kpi-${color}`}
      onClick={onClick}
      style={onClick ? { cursor: "pointer" } : undefined}
    >
      {Icon && (
        <div className="kpi-icon">
          <Icon size={22} />
        </div>
      )}
      <div>
        <div className="kpi-value">{value}</div>
        <div className="kpi-label">{label}</div>
      </div>
      {onAction && (
        <button
          className="kpi-action"
          onClick={(e) => {
            e.stopPropagation()
            onAction()
          }}
        >
          {actionLabel || "+ Add"}
        </button>
      )}
    </div>
  )
}

//! Status tabs component
export function StatusTabs({ tabs, active, onChange }) {
  return (
    <div className="status-tabs">
      {tabs.map((t) => (
        <button
          key={t.key}
          className={`status-tab st-${t.color} ${active === t.key ? "selected" : ""}`}
          onClick={() => onChange(t.key)}
        >
          {t.label} {t.count != null && `(${t.count})`}
        </button>
      ))}
    </div>
  )
}

//! Badge
const badgeColors = {
  active: "bg-green",
  inactive: "bg-gray",
  suspended: "bg-red",
  transferred: "bg-purple",
  "passed-out": "bg-pink",
  registered: "bg-blue",
  admitted: "bg-green",
  rejected: "bg-red",
  paid: "bg-green",
  partial: "bg-yellow",
  unpaid: "bg-red",
  refunded: "bg-gray",
  open: "bg-red",
  "in-progress": "bg-yellow",
  resolved: "bg-green",
  closed: "bg-gray",
  draft: "bg-gray",
  submitted: "bg-blue",
  locked: "bg-purple",
  published: "bg-green",
  scheduled: "bg-blue",
  ongoing: "bg-yellow",
  completed: "bg-green",
  low: "bg-blue",
  medium: "bg-yellow",
  high: "bg-red",
  critical: "bg-red",
  "in-use": "bg-green",
  maintenance: "bg-yellow",
  retired: "bg-gray",
  income: "bg-green",
  expense: "bg-red",
  present: "bg-green",
  absent: "bg-red",
  late: "bg-yellow",
  halfday: "bg-blue",
  leave: "bg-purple",
  merit: "bg-green",
  demerit: "bg-red",
  holiday: "bg-red",
  event: "bg-blue",
  exam: "bg-purple",
  allocated: "bg-green",
  planned: "bg-blue",
}
export function Badge({ value, color }) {
  if (value == null || value === "") return <span className="muted">—</span>
  const cls = color || badgeColors[String(value).toLowerCase()] || "bg-gray"
  return (
    <span className={`badge ${cls}`}>
      {String(value).replace(/-/g, " ").toUpperCase()}
    </span>
  )
}

//! Modal
export function Modal({ title, icon: Icon, onClose, children, footer, size }) {
  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()} // e.currentTarget is the element on which onMouseDown event listener is attached
    >
      <div
        className={`modal ${size === "lg" ? "modal-lg" : size === "sm" ? "modal-sm" : ""}`}
      >
        <div className="modal-head">
          {Icon && <Icon size={17} />} {title}
          <button className="x" onClick={onClose}>
            <X size={17} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  )
}

//! Field
export function Field({ label, required, children, full, hint }) {
  return (
    <div className={`field ${full ? "full" : ""}`}>
      <label>
        {label} {required && <span style={{ color: "var(--danger)" }}>*</span>}
      </label>
      {children}
      {hint && <span className="small muted">{hint}</span>}
    </div>
  )
}

//! Filter bar
export function FilterBar({ children, onClear }) {
  return (
    <div className="filter-card">
      <div className="filter-head">
        <FilterIcon size={15} /> Filters
        {onClear && (
          <button className="clear-btn" onClick={onClear}>
            Clear Filters
          </button>
        )}
      </div>
      <div className="filter-grid">{children}</div>
    </div>
  )
}

function plainValue(col, row) {
  const value = row[col.key]
  return value == null ? "" : value
}

//! DataTable
export function DataTable({ columns, rows, defaultPageSize = 10, footer }) {
  // Handle searchbar input
  const [search, setSearch] = useState("")
  // Controls total entries displayed on page
  const [pageSize, setPageSize] = useState(defaultPageSize)
  // Current page (page started from 0)
  const [page, setPage] = useState(0)
  // Handle sort by which property
  const [sortBy, setSortBy] = useState(null)
  // Handle sort by which direction (asc or desc)
  const [sortDir, setSortDir] = useState(1)

  const filtered = useMemo(() => {
    let entries = rows
    if (search) {
      const searchValue = search.toLowerCase()
      entries = rows.filter((r) =>
        columns.some((c) =>
          String(plainValue(c, r)).toLowerCase().includes(searchValue),
        ),
      )
    }
    if (sortBy) {
      const c = columns.find((col) => (col.key || col.label) === sortBy)
      entries = [...entries].sort((a, b) => {
        const aValue = plainValue(c, a)
        const bValue = plainValue(c, b)
        // The parseFloat() method parses a value as a string and returns the first number.
        const aNum = parseFloat(aValue)
        const bNum = parseFloat(bValue)
        if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
          return (aNum - bNum) * sortDir
        }
        // localeCompare() string method compares two string in alphabetical order
        // "Apple".localeCompare("Banana") Result -1 means "Apple comes before Banana"
        // "Banana".localeCompare("Apple") Result 1 means "Banana comes after Apple"
        // "Apple".localeCompare("Apple") Result 0
        return String(aValue).localeCompare(String(bValue)) * sortDir
      })
    }
    return entries
  }, [rows, search, sortBy, sortDir, columns])

  // Count total pages in pagination
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const slice = filtered.slice(page * pageSize, page * pageSize + pageSize)

  return (
    <div className="table-card">
      <div className="table-toolbar no-print">
        <span className="small muted">Show</span>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(+e.target.value)
            setPage(0)
          }}
          style={{
            border: "1px solid var(--border)",
            borderRadius: 6,
            padding: "5px 7px",
          }}
        >
          {[10, 25, 50, 100].map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
        <span className="small muted">entries</span>
        <div className="spacer" />
        <div className="mini-search">
          <Search size={14} />
          <input
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0)
            }}
          />
        </div>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key || c.label}
                  className={c.sortable === false ? "" : "sortable"}
                  onClick={() => {
                    if (c.sortable === false) return
                    const k = c.key || c.label
                    if (sortBy === k) {
                      setSortDir(-sortDir)
                    } else {
                      setSortBy(k)
                      setSortDir(1)
                    }
                  }}
                >
                  <div style={{ display: "flex", gap: "5px" }}>
                    <span>{c.label}</span>
                    {sortBy === (c.key || c.label) ? (
                      sortDir === 1 ? (
                        <MoveUp size={15} className="sort-icon" />
                      ) : (
                        <MoveDown size={15} className="sort-icon" />
                      )
                    ) : c.label !== "Actions" ? (
                      <ArrowUpDown size={15} className="sort-icon" />
                    ) : (
                      ""
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 && (
              <tr className="empty-row">
                <td colSpan={columns.length}>No records found</td>
              </tr>
            )}
            {slice.map((r, i) => (
              <tr key={r._id}>
                {columns.map((c) => (
                  <td key={c.key || c.label}>
                    {c.render ? c.render(r) : plainValue(c, r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-foot no-print">
        <span>
          Showing {filtered.length === 0 ? 0 : page * pageSize + 1} to{" "}
          {Math.min(filtered.length, (page + 1) * pageSize)} of{" "}
          {filtered.length} entries
        </span>
        {footer}
        <div className="pages">
          <button disabled={page === 0} onClick={() => setPage(page - 1)}>
            Previous
          </button>
          {Array.from({ length: pages })
            .slice(0, 7)
            .map((_, i) => (
              <button
                key={i}
                className={i === page ? "on" : ""}
                onClick={() => setPage(i)}
              >
                {i + 1}
              </button>
            ))}
          <button
            disabled={page === pages - 1}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

//! Login credentials modal
/* Shown once right after a student / parent login account is created,
because passwords are stored hashed and cannot be viewed later. */
export function CredentialsModal({ credentials = {}, name, onClose }) {
  const [copied, setCopied] = useState(false)
  const rows = [
    credentials.studentUsername && {
      role: "Student",
      username: credentials.studentUsername,
      password: credentials.studentPassword,
    },
    credentials.parentUsername && {
      role: "Parent",
      username: credentials.parentUsername,
      password: credentials.parentPassword,
    },
  ].filter((value) => Boolean(value))

  const copyAll = () => {
    const text = rows
      .map(
        (r) => `${r.role} — username: ${r.username} | password: ${r.password}`,
      )
      .join("\n")
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Modal
      title="Login Credentials Created"
      icon={KeyRound}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-blue" onClick={copyAll}>
            <Copy size={14} /> {copied ? "Copied!" : "Copy Credentials"}
          </button>
          <button className="btn btn-green" onClick={onClose}>
            Done
          </button>
        </>
      }
    >
      {name && (
        <p style={{ marginBottom: 10 }}>
          Login accounts for <b>{name}</b>:
        </p>
      )}
      <table className="data-table mb">
        <thead>
          <tr>
            <th>Role</th>
            <th>Username</th>
            <th>Password</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr className="empty-row">
              <td colSpan={3}>No new login accounts were created</td>
            </tr>
          )}
          {rows.map((r) => (
            <tr key={r.role}>
              <td>
                <Badge
                  value={r.role}
                  color={r.role === "Student" ? "bg-green" : "bg-pink"}
                />
              </td>
              <td className="mono">
                <b>{r.username}</b>
              </td>
              <td className="mono">
                <b>{r.password}</b>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="small muted">
        Share these with the {rows.length > 1 ? "student and parent" : "user"}{" "}
        now — passwords are stored encrypted and cannot be viewed again. You can
        reset them anytime from Users Management.
      </p>
    </Modal>
  )
}

//! Confirm dialog
export function Confirm({
  title = "Are you sure?",
  message,
  onYes,
  onNo,
  yesLabel = "Yes, Delete",
  danger = true,
}) {
  return (
    <Modal
      title={title}
      onClose={onNo}
      size="sm"
      footer={
        <>
          <button className="btn btn-gray" onClick={onNo}>
            Cancel
          </button>
          <button
            className={`btn ${danger ? "btn-red" : "btn-green"}`}
            onClick={onYes}
          >
            {yesLabel}
          </button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  )
}

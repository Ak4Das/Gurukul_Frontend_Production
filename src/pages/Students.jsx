import { useEffect, useMemo, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
  GraduationCap,
  Plus,
  Eye,
  Wallet,
  CalendarCheck,
  Award,
  UsersRound,
  Pencil,
  Trash2,
  CreditCard,
  Printer,
  FileText,
} from "lucide-react"
import { api, errMsg } from "../api"
import { useApp } from "../context/AppContext"
import { useLookups, className } from "../hooks/useLookups"
import {
  DataTable,
  StatusTabs,
  FilterBar,
  Field,
  Modal,
  Badge,
  Confirm,
  CredentialsModal,
} from "../components/ui"

const HOUSE_COLORS = {
  Red: "bg-solid-red",
  Blue: "bg-solid-blue",
  Green: "bg-solid-green",
  Yellow: "bg-solid-orange",
}
const HOUSE_HEX = {
  Red: "#dc2626",
  Blue: "#2563eb",
  Green: "#16a34a",
  Yellow: "#f59e0b",
}

// Deterministic pseudo-barcode from the admission number
function Barcode({ code }) {
  const bars = String(code)
    .split("")
    .flatMap((ch) => {
      const n = ch.charCodeAt(0)
      return [(n % 3) + 1, ((n >> 2) % 3) + 1]
    })
  return (
    <div className="barcode">
      {bars.map((h, i) => (
        <i
          key={i}
          style={{ height: `${h * 10 + 4}px`, width: i % 3 === 0 ? 3 : 2 }}
        />
      ))}
    </div>
  )
}

const EMPTY = {
  firstName: "",
  lastName: "",
  gender: "Male",
  dob: "",
  nationality: "",
  curriculum: "IB PYP",
  englishLevel: "NATIVE",
  house: "Red",
  classId: "",
  rollNo: "",
  admissionDate: "",
  transportRequired: false,
  transportRoute: "",
  allergies: "",
  medicalNotes: "",
  languages: "",
  address: "",
  parentName: "",
  parentRelation: "Father",
  parentMobile: "",
  parentEmail: "",
  parentOccupation: "",
  loginPassword: "",
  parentPassword: "",
}

export default function Students() {
  const { notify, settings, user } = useApp()
  const { classes } = useLookups(["classes"])
  const [rows, setRows] = useState([])
  const [tab, setTab] = useState("all")
  const [filters, setFilters] = useState({
    search: "",
    classId: "",
    gender: "",
    curriculum: "",
    englishLevel: "",
    house: "",
    hasAllergies: false,
  })
  const [modal, setModal] = useState(null) // {type: 'form'|'fees'|'attendance'|'results'|'parents'|'view', data}
  const [form, setForm] = useState(EMPTY)
  const [confirmDel, setConfirmDel] = useState(null)
  const [params] = useSearchParams()
  const canWrite = ["admin", "clerk", "supervisor"].includes(user?.role)

  const load = () => api.get("/students").then(({ data }) => setRows(data))
  useEffect(() => {
    load()
  }, [])
  useEffect(() => {
    if (params.get("add")) openAdd()
  }, [params])

  const counts = useMemo(() => {
    const c = { all: rows.length }
    for (const s of [
      "active",
      "inactive",
      "transferred",
      "passed-out",
      "suspended",
    ]) {
      c[s] = rows.filter((r) => r.status === s).length
    }
    return c
  }, [rows])

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (tab !== "all" && r.status !== tab) return false
        if (filters.classId && r.classId !== filters.classId) return false
        if (filters.gender && r.gender !== filters.gender) return false
        if (filters.curriculum && r.curriculum !== filters.curriculum)
          return false
        if (filters.englishLevel && r.englishLevel !== filters.englishLevel)
          return false
        if (filters.house && r.house !== filters.house) return false
        if (filters.hasAllergies && !r.allergies) return false
        if (filters.search) {
          const t = filters.search.toLowerCase()
          if (
            !`${r.firstName} ${r.lastName} ${r.admissionNo} ${r.rollNo}`
              .toLowerCase()
              .includes(t)
          )
            return false
        }
        return true
      }),
    [rows, tab, filters],
  )

  const openAdd = () => {
    setForm(EMPTY)
    setModal({ type: "form" })
  }
  const openEdit = (r) => {
    setForm({ ...EMPTY, ...r })
    setModal({ type: "form", data: r })
  }

  const save = async () => {
    try {
      if (modal.data?._id) {
        await api.put(`/students/${modal.data._id}`, form)
        notify("Student updated")
        setModal(null)
      } else {
        const { data } = await api.post("/students", form)
        notify("Student added successfully")
        setModal({
          type: "credentials",
          data: data.credentials,
          name: `${form.firstName} ${form.lastName}`.trim(),
        })
      }
      load()
    } catch (e) {
      notify(errMsg(e), "error")
    }
  }

  const openQuick = async (type, r) => {
    try {
      const { data } = await api.get(`/students/${r._id}/${type}`)
      setModal({ type, data, student: r })
    } catch (e) {
      notify(errMsg(e), "error")
    }
  }

  const cur = settings.currency || "₹"

  const columns = [
    {
      key: "admissionNo",
      label: "Adm #",
      render: (r) => (
        <span
          className="mono link-like"
          onClick={() => setModal({ type: "view", data: r })}
        >
          {r.admissionNo}
        </span>
      ),
    },
    {
      key: "firstName",
      label: "Student",
      render: (r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="badge bg-navy">S</span>
          <div>
            <b>
              {r.firstName} {r.lastName}
            </b>
            <div className="small muted">
              Roll {r.rollNo || "—"} {r.gender === "Female" ? "♀" : "♂"}
            </div>
          </div>
        </div>
      ),
      exportValue: (r) => `${r.firstName} ${r.lastName}`,
    },
    { key: "nationality", label: "Nationality" },
    {
      key: "curriculum",
      label: "Curriculum",
      render: (r) => <Badge value={r.curriculum} color="bg-solid-green" />,
    },
    {
      key: "englishLevel",
      label: "EAL",
      render: (r) => (
        <Badge
          value={r.englishLevel}
          color={r.englishLevel === "NATIVE" ? "bg-teal" : "bg-yellow"}
        />
      ),
    },
    {
      key: "classId",
      label: "Class",
      value: (r) => className(classes, r.classId),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <Badge value={r.status} />,
    },
    {
      key: "house",
      label: "House",
      render: (r) => <Badge value={r.house} color={HOUSE_COLORS[r.house]} />,
    },
    {
      key: "allergies",
      label: "Allergies",
      render: (r) =>
        r.allergies ? (
          <span className="txt-red small">
            <b>⚠ Allergy</b>
          </span>
        ) : (
          <span className="muted">—</span>
        ),
    },
    {
      label: "Actions",
      sortable: false,
      noExport: true,
      render: (r) => (
        <div className="row-actions">
          <button
            className="act-view"
            title="View profile"
            onClick={() => setModal({ type: "view", data: r })}
          >
            <Eye size={15} />
          </button>
          <button
            className="act-green"
            title="Fee dues"
            onClick={() => openQuick("fees", r)}
          >
            <Wallet size={15} />
          </button>
          <button
            className="act-orange"
            title="Attendance report"
            onClick={() => openQuick("attendance", r)}
          >
            <CalendarCheck size={15} />
          </button>
          <button
            className="act-navy"
            title="Exam results"
            onClick={() => openQuick("results", r)}
          >
            <Award size={15} />
          </button>
          <button
            className="act-purple"
            title="Linked parents"
            onClick={() => openQuick("parents", r)}
          >
            <UsersRound size={15} />
          </button>
          <button
            className="act-view"
            title="ID Card"
            onClick={() => setModal({ type: "idcard", data: r })}
          >
            <CreditCard size={15} />
          </button>
          {canWrite && (
            <button
              className="act-edit"
              title="Edit"
              onClick={() => openEdit(r)}
            >
              <Pencil size={15} />
            </button>
          )}
          {user?.role === "admin" && (
            <button
              className="act-del"
              title="Delete"
              onClick={() => setConfirmDel(r)}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="page-head">
        <h2>
          <GraduationCap size={20} /> Students Management
        </h2>
        <div className="spacer" />
        {canWrite && (
          <button className="btn btn-green" onClick={openAdd}>
            <Plus size={15} /> Add Student
          </button>
        )}
      </div>

      <StatusTabs
        active={tab}
        onChange={setTab}
        tabs={[
          { key: "all", label: "All", count: counts.all, color: "navy" },
          {
            key: "active",
            label: "Active",
            count: counts.active,
            color: "green",
          },
          {
            key: "inactive",
            label: "Inactive",
            count: counts.inactive,
            color: "gray",
          },
          {
            key: "transferred",
            label: "Transferred",
            count: counts.transferred,
            color: "purple",
          },
          {
            key: "passed-out",
            label: "Passed Out",
            count: counts["passed-out"],
            color: "pink",
          },
          {
            key: "suspended",
            label: "Suspended",
            count: counts.suspended,
            color: "red",
          },
        ]}
      />

      <FilterBar
        onClear={() =>
          setFilters({
            search: "",
            classId: "",
            gender: "",
            curriculum: "",
            englishLevel: "",
            house: "",
            hasAllergies: false,
          })
        }
      >
        <Field label="Search">
          <input
            placeholder="Search students..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </Field>
        <Field label="Class">
          <select
            value={filters.classId}
            onChange={(e) =>
              setFilters({ ...filters, classId: e.target.value })
            }
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} {c.section} ({c.academicYear})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Gender">
          <select
            value={filters.gender}
            onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
          >
            <option value="">All Genders</option>
            <option>Male</option>
            <option>Female</option>
          </select>
        </Field>
        <Field label="Curriculum">
          <select
            value={filters.curriculum}
            onChange={(e) =>
              setFilters({ ...filters, curriculum: e.target.value })
            }
          >
            <option value="">All Curricula</option>
            <option>IB PYP</option>
            <option>CBSE</option>
            <option>ICSE</option>
            <option>State Board</option>
          </select>
        </Field>
        <Field label="English Level">
          <select
            value={filters.englishLevel}
            onChange={(e) =>
              setFilters({ ...filters, englishLevel: e.target.value })
            }
          >
            <option value="">All Levels</option>
            {["NATIVE", "C2", "C1", "B2", "B1", "A2", "A1"].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </Field>
        <Field label="House">
          <select
            value={filters.house}
            onChange={(e) => setFilters({ ...filters, house: e.target.value })}
          >
            <option value="">All Houses</option>
            {["Red", "Blue", "Green", "Yellow"].map((h) => (
              <option key={h}>{h}</option>
            ))}
          </select>
        </Field>
        <Field label="Has Allergies">
          <label
            style={{
              display: "flex",
              gap: 7,
              alignItems: "center",
              textTransform: "none",
              fontSize: 13,
            }}
          >
            <input
              type="checkbox"
              style={{ width: "auto" }}
              checked={filters.hasAllergies}
              onChange={(e) =>
                setFilters({ ...filters, hasAllergies: e.target.checked })
              }
            />
            <span className="txt-red">⚠ Has allergies</span>
          </label>
        </Field>
      </FilterBar>

      <DataTable columns={columns} rows={filtered} />

      {/* ------- Add / Edit form ------- */}
      {modal?.type === "form" && (
        <Modal
          title={modal.data ? "Edit Student" : "Add Student"}
          icon={GraduationCap}
          size="lg"
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="btn btn-gray" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button className="btn btn-green" onClick={save}>
                {modal.data ? "Update Student" : "Add Student"}
              </button>
            </>
          }
        >
          <div className="form-grid">
            <div className="form-section">Personal Information</div>
            <Field label="First Name" required>
              <input
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
              />
            </Field>
            <Field label="Last Name">
              <input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </Field>
            <Field label="Gender">
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option>Male</option>
                <option>Female</option>
              </select>
            </Field>
            <Field label="Date of Birth">
              <input
                type="date"
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
              />
            </Field>
            <Field label="Nationality / Citizenship">
              <input
                value={form.nationality}
                onChange={(e) =>
                  setForm({ ...form, nationality: e.target.value })
                }
                placeholder="e.g. Indian"
              />
            </Field>
            <Field label="Languages Spoken">
              <input
                value={form.languages}
                onChange={(e) =>
                  setForm({ ...form, languages: e.target.value })
                }
                placeholder="e.g. English, Hindi"
              />
            </Field>
            <Field label="Address" full>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </Field>

            <div className="form-section">Academic</div>
            <Field label="Class" required>
              <select
                value={form.classId}
                onChange={(e) => setForm({ ...form, classId: e.target.value })}
              >
                <option value="">Select class…</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.section} ({c.academicYear})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Roll No">
              <input
                value={form.rollNo}
                onChange={(e) => setForm({ ...form, rollNo: e.target.value })}
              />
            </Field>
            <Field label="Curriculum">
              <select
                value={form.curriculum}
                onChange={(e) =>
                  setForm({ ...form, curriculum: e.target.value })
                }
              >
                <option>IB PYP</option>
                <option>CBSE</option>
                <option>ICSE</option>
                <option>State Board</option>
              </select>
            </Field>
            <Field label="English Level (EAL)">
              <select
                value={form.englishLevel}
                onChange={(e) =>
                  setForm({ ...form, englishLevel: e.target.value })
                }
              >
                {["NATIVE", "C2", "C1", "B2", "B1", "A2", "A1"].map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </Field>
            <Field label="House">
              <select
                value={form.house}
                onChange={(e) => setForm({ ...form, house: e.target.value })}
              >
                {["Red", "Blue", "Green", "Yellow"].map((h) => (
                  <option key={h}>{h}</option>
                ))}
              </select>
            </Field>
            <Field label="Admission Date">
              <input
                type="date"
                value={form.admissionDate}
                onChange={(e) =>
                  setForm({ ...form, admissionDate: e.target.value })
                }
              />
            </Field>
            {modal.data && (
              <Field label="Status">
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {[
                    "active",
                    "inactive",
                    "transferred",
                    "passed-out",
                    "suspended",
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
            )}

            <div className="form-section">Transport</div>
            <Field label="Transport Required">
              <select
                value={form.transportRequired ? "yes" : "no"}
                onChange={(e) =>
                  setForm({
                    ...form,
                    transportRequired: e.target.value === "yes",
                  })
                }
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </Field>
            <Field label="Transport Route">
              <input
                value={form.transportRoute}
                disabled={!form.transportRequired}
                onChange={(e) =>
                  setForm({ ...form, transportRoute: e.target.value })
                }
                placeholder="e.g. Route 2"
              />
            </Field>

            <div className="form-section">Medical Notes</div>
            <Field label="Allergies">
              <input
                value={form.allergies}
                onChange={(e) =>
                  setForm({ ...form, allergies: e.target.value })
                }
                placeholder="e.g. Peanuts"
              />
            </Field>
            <Field label="Health Restrictions">
              <input
                value={form.medicalNotes}
                onChange={(e) =>
                  setForm({ ...form, medicalNotes: e.target.value })
                }
              />
            </Field>

            {!modal.data && (
              <>
                <div className="form-section">Parent / Guardian</div>
                <Field label="Parent Name">
                  <input
                    value={form.parentName}
                    onChange={(e) =>
                      setForm({ ...form, parentName: e.target.value })
                    }
                  />
                </Field>
                <Field label="Relation">
                  <select
                    value={form.parentRelation}
                    onChange={(e) =>
                      setForm({ ...form, parentRelation: e.target.value })
                    }
                  >
                    <option>Father</option>
                    <option>Mother</option>
                    <option>Guardian</option>
                  </select>
                </Field>
                <Field
                  label="Parent Mobile"
                  hint="Reuses existing parent if mobile matches"
                >
                  <input
                    value={form.parentMobile}
                    onChange={(e) =>
                      setForm({ ...form, parentMobile: e.target.value })
                    }
                  />
                </Field>
                <Field label="Parent Email">
                  <input
                    value={form.parentEmail}
                    onChange={(e) =>
                      setForm({ ...form, parentEmail: e.target.value })
                    }
                  />
                </Field>

                <div className="form-section">Login Passwords</div>
                <Field
                  label="Student Login Password"
                  hint="Leave blank for default: student123"
                >
                  <input
                    value={form.loginPassword}
                    onChange={(e) =>
                      setForm({ ...form, loginPassword: e.target.value })
                    }
                  />
                </Field>
                <Field
                  label="Parent Login Password"
                  hint="Leave blank for default: parent123"
                >
                  <input
                    value={form.parentPassword}
                    onChange={(e) =>
                      setForm({ ...form, parentPassword: e.target.value })
                    }
                  />
                </Field>
              </>
            )}
          </div>
        </Modal>
      )}

      {/* ------- Login credentials (shown once after adding) ------- */}
      {modal?.type === "credentials" && (
        <CredentialsModal
          credentials={modal.data}
          name={modal.name}
          onClose={() => setModal(null)}
        />
      )}

      {/* ------- View profile ------- */}
      {modal?.type === "view" && (
        <Modal
          title={`${modal.data.firstName} ${modal.data.lastName}`}
          icon={Eye}
          onClose={() => setModal(null)}
        >
          <div className="form-grid">
            {[
              ["Admission #", modal.data.admissionNo],
              ["Roll No", modal.data.rollNo],
              ["Gender", modal.data.gender],
              ["Date of Birth", modal.data.dob],
              ["Class", className(classes, modal.data.classId)],
              ["Status", modal.data.status],
              ["Nationality", modal.data.nationality],
              ["Curriculum", modal.data.curriculum],
              ["English Level", modal.data.englishLevel],
              ["House", modal.data.house],
              ["Languages", modal.data.languages],
              ["Admission Date", modal.data.admissionDate],
              [
                "Transport",
                modal.data.transportRequired
                  ? `Yes — ${modal.data.transportRoute}`
                  : "No",
              ],
              ["Allergies", modal.data.allergies || "None"],
              ["Medical Notes", modal.data.medicalNotes || "—"],
              ["Address", modal.data.address],
            ].map(([k, v]) => (
              <div key={k} className="field">
                <label>{k}</label>
                <div style={{ fontWeight: 600 }}>{v || "—"}</div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* ------- Quick: Fees ------- */}
      {modal?.type === "fees" && (
        <Modal
          title={`Fee Summary — ${modal.student.firstName} ${modal.student.lastName}`}
          icon={Wallet}
          size="lg"
          onClose={() => setModal(null)}
        >
          <table className="data-table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Date</th>
                <th>Due</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {modal.data.receipts.length === 0 && (
                <tr className="empty-row">
                  <td colSpan={6}>No receipts yet</td>
                </tr>
              )}
              {modal.data.receipts.map((r) => (
                <tr key={r._id}>
                  <td className="mono">{r.receiptNo}</td>
                  <td>{r.date}</td>
                  <td>
                    {cur}
                    {r.amountDue?.toLocaleString()}
                  </td>
                  <td>
                    {cur}
                    {r.amountPaid?.toLocaleString()}
                  </td>
                  <td className={r.balance > 0 ? "txt-red" : "txt-green"}>
                    {cur}
                    {r.balance?.toLocaleString()}
                  </td>
                  <td>
                    <Badge value={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal>
      )}

      {/* ------- Quick: Attendance ------- */}
      {modal?.type === "attendance" && (
        <Modal
          title={`Attendance — ${modal.student.firstName} ${modal.student.lastName}`}
          icon={CalendarCheck}
          onClose={() => setModal(null)}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 14,
            }}
          >
            {Object.entries(modal.data.summary).map(([k, v]) => (
              <Badge
                key={k}
                value={`${k}: ${v}`}
                color={
                  {
                    present: "bg-green",
                    absent: "bg-red",
                    late: "bg-yellow",
                    halfday: "bg-blue",
                    leave: "bg-purple",
                  }[k]
                }
              />
            ))}
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {modal.data.records.slice(0, 30).map((r, i) => (
                <tr key={i}>
                  <td>{r.date}</td>
                  <td>
                    <Badge value={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal>
      )}

      {/* ------- Quick: Results ------- */}
      {modal?.type === "results" && (
        <Modal
          title={`Results — ${modal.student.firstName} ${modal.student.lastName}`}
          icon={Award}
          size="lg"
          onClose={() => setModal(null)}
          footer={
            modal.data.results.length > 0 && (
              <button
                className="btn btn-navy"
                onClick={() => setModal({ ...modal, type: "reportcard" })}
              >
                <FileText size={15} /> Print Report Card
              </button>
            )
          }
        >
          <table className="data-table">
            <thead>
              <tr>
                <th>Exam</th>
                <th>Subject</th>
                <th>Marks</th>
                <th>Grade</th>
                <th>Sheet Status</th>
              </tr>
            </thead>
            <tbody>
              {modal.data.results.length === 0 && (
                <tr className="empty-row">
                  <td colSpan={5}>No results yet</td>
                </tr>
              )}
              {modal.data.results.map((r, i) => (
                <tr key={i}>
                  <td>{r.examName}</td>
                  <td>{r.subject}</td>
                  <td>
                    <b>{r.marks ?? "—"}</b> / {r.maxMarks}
                  </td>
                  <td>
                    <Badge
                      value={r.grade}
                      color={r.grade === "F" ? "bg-red" : "bg-green"}
                    />
                  </td>
                  <td>
                    <Badge value={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal>
      )}

      {/* ------- Printable report card ------- */}
      {modal?.type === "reportcard" &&
        (() => {
          const s = modal.student
          const byExam = {}
          for (const r of modal.data.results)
            (byExam[r.examName] = byExam[r.examName] || []).push(r)
          return (
            <Modal
              title="Report Card"
              icon={FileText}
              size="lg"
              onClose={() => setModal(null)}
              footer={
                <>
                  <button
                    className="btn btn-gray"
                    onClick={() => setModal(null)}
                  >
                    Close
                  </button>
                  <button
                    className="btn btn-navy"
                    onClick={() => window.print()}
                  >
                    <Printer size={15} /> Print A4
                  </button>
                </>
              }
            >
              <div className="doc-a4 print-area">
                <div style={{ textAlign: "center" }}>
                  <h1>{settings.schoolName}</h1>
                  <div className="small">
                    {settings.address} · {settings.phone}
                  </div>
                </div>
                <div className="band">
                  STUDENT REPORT CARD — {settings.academicYear}
                </div>
                <table style={{ marginBottom: 16 }}>
                  <tbody>
                    <tr>
                      <td>
                        <b>Name:</b> {s.firstName} {s.lastName}
                      </td>
                      <td>
                        <b>Admission #:</b> {s.admissionNo}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <b>Class:</b> {className(classes, s.classId)}
                      </td>
                      <td>
                        <b>Roll No:</b> {s.rollNo || "—"}
                      </td>
                    </tr>
                  </tbody>
                </table>
                {Object.entries(byExam).map(([exam, results]) => {
                  const total = results.reduce((t, r) => t + (r.marks || 0), 0)
                  const max = results.reduce((t, r) => t + (r.maxMarks || 0), 0)
                  const pct = max ? Math.round((total / max) * 1000) / 10 : 0
                  return (
                    <div key={exam} style={{ marginBottom: 18 }}>
                      <h3 style={{ margin: "10px 0 6px" }}>{exam}</h3>
                      <table className="lines">
                        <thead>
                          <tr>
                            <th>Subject</th>
                            <th>Marks Obtained</th>
                            <th>Max Marks</th>
                            <th>Grade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.map((r, i) => (
                            <tr key={i}>
                              <td>{r.subject}</td>
                              <td>{r.marks ?? "—"}</td>
                              <td>{r.maxMarks}</td>
                              <td>
                                <b>{r.grade || "—"}</b>
                              </td>
                            </tr>
                          ))}
                          <tr style={{ fontWeight: 700 }}>
                            <td>Total</td>
                            <td>{total}</td>
                            <td>{max}</td>
                            <td>{pct}%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )
                })}
                <div className="sig-row">
                  <span>Class Teacher</span>
                  <span>Parent / Guardian</span>
                  <span>Principal</span>
                </div>
              </div>
            </Modal>
          )
        })()}

      {/* ------- Student ID card ------- */}
      {modal?.type === "idcard" &&
        (() => {
          const s = modal.data
          return (
            <Modal
              title={`ID Card — ${s.firstName} ${s.lastName}`}
              icon={CreditCard}
              onClose={() => setModal(null)}
              footer={
                <>
                  <button
                    className="btn btn-gray"
                    onClick={() => setModal(null)}
                  >
                    Close
                  </button>
                  <button
                    className="btn btn-navy"
                    onClick={() => window.print()}
                  >
                    <Printer size={15} /> Print
                  </button>
                </>
              }
            >
              <div className="print-area" style={{ padding: "10px 0" }}>
                <div className="id-card">
                  <div className="idc-head">
                    <GraduationCap size={30} />
                    <div>
                      <div className="sch">{settings.schoolName}</div>
                      <div className="tag">
                        STUDENT IDENTITY CARD · {settings.academicYear}
                      </div>
                    </div>
                  </div>
                  <div className="idc-body">
                    <div
                      className="idc-photo"
                      style={{
                        background: HOUSE_HEX[s.house] || "var(--primary)",
                      }}
                    >
                      {s.firstName[0]}
                      {(s.lastName || " ")[0]}
                    </div>
                    <table>
                      <tbody>
                        <tr>
                          <td>Name</td>
                          <td>
                            <b>
                              {s.firstName} {s.lastName}
                            </b>
                          </td>
                        </tr>
                        <tr>
                          <td>Class</td>
                          <td>{className(classes, s.classId)}</td>
                        </tr>
                        <tr>
                          <td>Roll No</td>
                          <td>{s.rollNo || "—"}</td>
                        </tr>
                        <tr>
                          <td>House</td>
                          <td>{s.house}</td>
                        </tr>
                        <tr>
                          <td>DOB</td>
                          <td>{s.dob || "—"}</td>
                        </tr>
                        <tr>
                          <td>Blood / Allergy</td>
                          <td>{s.allergies ? `⚠ ${s.allergies}` : "None"}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <Barcode code={s.admissionNo} />
                  <div className="idc-no">{s.admissionNo}</div>
                  <div
                    className="idc-strip"
                    style={{
                      background: HOUSE_HEX[s.house] || "var(--primary)",
                    }}
                  />
                </div>
              </div>
            </Modal>
          )
        })()}

      {/* ------- Quick: Parents ------- */}
      {modal?.type === "parents" && (
        <Modal
          title={`Linked Parents — ${modal.student.firstName} ${modal.student.lastName}`}
          icon={UsersRound}
          onClose={() => setModal(null)}
        >
          {modal.data.length === 0 && (
            <p className="muted">No parents linked.</p>
          )}
          {modal.data.map((p) => (
            <div
              key={p._id}
              className="card card-pad mb"
              style={{ border: "1px solid var(--border)", boxShadow: "none" }}
            >
              <b>{p.name}</b> <Badge value={p.relation} color="bg-blue" />
              <div className="small muted mt" style={{ marginTop: 6 }}>
                {p.mobile} · {p.email || "no email"} · {p.occupation || "—"}
              </div>
            </div>
          ))}
        </Modal>
      )}

      {confirmDel && (
        <Confirm
          message={`Delete student "${confirmDel.firstName} ${confirmDel.lastName}" (${confirmDel.admissionNo})? This also removes their login.`}
          onNo={() => setConfirmDel(null)}
          onYes={async () => {
            try {
              await api.delete(`/students/${confirmDel._id}`)
              notify("Student deleted")
              load()
            } catch (e) {
              notify(errMsg(e), "error")
            }
            setConfirmDel(null)
          }}
        />
      )}
    </>
  )
}

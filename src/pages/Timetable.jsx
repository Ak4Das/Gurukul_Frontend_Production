import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { CalendarRange, Save, Printer } from "lucide-react"
import { api, errMsg } from "../api"
import { useApp } from "../context/AppContext"
import { useLookups } from "../hooks/useLookups"
import { Field } from "../components/ui"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
const SLOTS = [
  { no: 1, start: "08:30", end: "09:15" },
  { no: 2, start: "09:15", end: "10:00" },
  { no: 3, start: "10:15", end: "11:00" },
  { no: 4, start: "11:00", end: "11:45" },
  { no: 5, start: "12:30", end: "13:15" },
]

export default function Timetable() {
  const { notify, user } = useApp()
  const { classes, subjects, teachers } = useLookups([
    "classes",
    "subjects",
    "teachers",
  ])
  const [classId, setClassId] = useState("")
  const [periods, setPeriods] = useState([])
  const [dirty, setDirty] = useState(false)
  const [params] = useSearchParams()
  const canWrite = ["admin", "clerk", "supervisor"].includes(user?.role)

  useEffect(() => {
    const pre = params.get("classId")
    if (pre) setClassId(pre)
  }, [params])

  useEffect(() => {
    if (!classId) {
      setPeriods([])
      return
    }
    api.get(`/timetables/${classId}`).then(({ data }) => {
      setPeriods(data.periods || [])
      setDirty(false)
    })
  }, [classId])

  const getCell = (day, no) =>
    periods.find((p) => p.day === day && p.period === no)

  const setCell = (day, slot, subjectId, teacherId) => {
    const subj = subjects.find((s) => s._id === subjectId)
    const teacher = teachers.find((t) => t._id === teacherId)
    setPeriods((prev) => {
      const rest = prev.filter((p) => !(p.day === day && p.period === slot.no))
      if (!subjectId && !teacherId) return rest
      const existing = getCell(day, slot.no) || {}
      return [
        ...rest,
        {
          day,
          period: slot.no,
          start: slot.start,
          end: slot.end,
          subjectId: subjectId ?? existing.subjectId,
          subjectName: subj?.name || existing.subjectName || "Free",
          teacherId: teacherId ?? existing.teacherId,
          teacherName: teacher?.fullName || existing.teacherName || "",
        },
      ]
    })
    setDirty(true)
  }

  const save = async () => {
    try {
      await api.post(`/timetables/${classId}`, { periods })
      notify("Timetable saved")
      setDirty(false)
    } catch (e) {
      notify(errMsg(e), "error")
    }
  }

  const printIt = () => window.print()

  return (
    <>
      <div className="page-head no-print">
        <h2>
          <CalendarRange size={20} /> Timetable
        </h2>
        <div className="spacer" />
        {classId && (
          <button className="btn btn-blue" onClick={printIt}>
            <Printer size={15} /> Print
          </button>
        )}
        {canWrite && classId && (
          <button className="btn btn-green" disabled={!dirty} onClick={save}>
            <Save size={15} /> Save Timetable
          </button>
        )}
      </div>

      <div className="filter-card no-print">
        <div className="filter-grid">
          <Field label="Class" required>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
            >
              <option value="">Select class…</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} {c.section} ({c.academicYear})
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      {!classId && (
        <div className="card card-pad muted">
          Select a class to view or edit its weekly timetable.
        </div>
      )}

      {classId && (
        <div className="table-card print-area">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Period</th>
                  {DAYS.map((d) => (
                    <th key={d}>{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SLOTS.map((slot) => (
                  <tr key={slot.no}>
                    <td>
                      <b>P{slot.no}</b>
                      <div className="small muted">
                        {slot.start} – {slot.end}
                      </div>
                    </td>
                    {DAYS.map((day) => {
                      const cell = getCell(day, slot.no)
                      return (
                        <td key={day}>
                          {canWrite ? (
                            <div
                              style={{ display: "grid", gap: 4, minWidth: 130 }}
                            >
                              <select
                                value={cell?.subjectId || ""}
                                style={{
                                  border: "1px solid var(--border)",
                                  borderRadius: 5,
                                  padding: "4px 6px",
                                  fontSize: 12,
                                }}
                                onChange={(e) =>
                                  setCell(
                                    day,
                                    slot,
                                    e.target.value || null,
                                    cell?.teacherId,
                                  )
                                }
                              >
                                <option value="">Free</option>
                                {subjects
                                  .filter(
                                    (s) =>
                                      !s.classIds?.length ||
                                      s.classIds.includes(classId),
                                  )
                                  .map((s) => (
                                    <option key={s._id} value={s._id}>
                                      {s.name}
                                    </option>
                                  ))}
                              </select>
                              <select
                                value={cell?.teacherId || ""}
                                style={{
                                  border: "1px solid var(--border)",
                                  borderRadius: 5,
                                  padding: "4px 6px",
                                  fontSize: 12,
                                }}
                                onChange={(e) =>
                                  setCell(
                                    day,
                                    slot,
                                    cell?.subjectId,
                                    e.target.value || null,
                                  )
                                }
                              >
                                <option value="">— teacher —</option>
                                {teachers.map((t) => (
                                  <option key={t._id} value={t._id}>
                                    {t.fullName}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : cell?.subjectName &&
                            cell.subjectName !== "Free" ? (
                            <div>
                              <b>{cell.subjectName}</b>
                              <div className="small muted">
                                {cell.teacherName}
                              </div>
                            </div>
                          ) : (
                            <span className="muted">—</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}

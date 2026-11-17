import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { BookOpen, Plus, Pencil, Trash2 } from "lucide-react"
import { api, errMsg } from "../api"
import { useApp } from "../context/AppContext"
import { useLookups } from "../hooks/useLookups"
import { DataTable, Field, Modal, Badge, Confirm } from "../components/ui"

const EMPTY = {
  name: "",
  code: "",
  maxMarks: 100,
  passingMarks: 33,
  classIds: [],
}

export default function Subjects() {
  const { notify, user } = useApp()
  const { classes } = useLookups(["classes"])
  const [rows, setRows] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [confirmDel, setConfirmDel] = useState(null)
  const [params] = useSearchParams()
  const canWrite = ["admin", "clerk", "supervisor"].includes(user?.role)

  const load = () => api.get("/subjects").then(({ data }) => setRows(data))
  useEffect(() => {
    load()
  }, [])
  useEffect(() => {
    if (params.get("add")) {
      setForm(EMPTY)
      setModal({ type: "form" })
    }
  }, [params])

  const save = async () => {
    try {
      if (modal.data?._id) await api.put(`/subjects/${modal.data._id}`, form)
      else await api.post("/subjects", form)
      notify("Subject saved")
      setModal(null)
      load()
    } catch (e) {
      notify(errMsg(e), "error")
    }
  }

  const toggleClass = (id) => {
    setForm((f) => ({
      ...f,
      classIds: f.classIds.includes(id)
        ? f.classIds.filter((x) => x !== id)
        : [...f.classIds, id],
    }))
  }

  const columns = [
    { key: "name", label: "Subject", render: (r) => <b>{r.name}</b> },
    {
      key: "code",
      label: "Code",
      render: (r) => <span className="mono">{r.code}</span>,
    },
    { key: "maxMarks", label: "Max Marks" },
    { key: "passingMarks", label: "Passing Marks" },
    {
      label: "Assigned Classes",
      value: (r) => (r.classIds || []).length,
      render: (r) => (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {(r.classIds || []).map((id) => {
            const c = classes.find((x) => x._id === id)
            return c ? (
              <Badge
                key={id}
                value={`${c.name} ${c.section}`}
                color="bg-blue"
              />
            ) : null
          })}
          {!(r.classIds || []).length && (
            <span className="muted">All / none</span>
          )}
        </div>
      ),
    },
    {
      label: "Actions",
      sortable: false,
      noExport: true,
      render: (r) => (
        <div className="row-actions">
          {canWrite && (
            <button
              className="act-edit"
              title="Edit"
              onClick={() => {
                setForm({ ...EMPTY, ...r, classIds: r.classIds || [] })
                setModal({ type: "form", data: r })
              }}
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
          <BookOpen size={20} /> Subjects Management
        </h2>
        <div className="spacer" />
        {canWrite && (
          <button
            className="btn btn-green"
            onClick={() => {
              setForm(EMPTY)
              setModal({ type: "form" })
            }}
          >
            <Plus size={15} /> Add Subject
          </button>
        )}
      </div>

      <DataTable columns={columns} rows={rows} />

      {modal?.type === "form" && (
        <Modal
          title={modal.data ? "Edit Subject" : "Add Subject"}
          icon={BookOpen}
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="btn btn-gray" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button className="btn btn-green" onClick={save}>
                {modal.data ? "Update" : "Add Subject"}
              </button>
            </>
          }
        >
          <div className="form-grid">
            <Field label="Subject Name" required>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Field label="Subject Code">
              <input
                value={form.code}
                placeholder="e.g. MATH-01"
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </Field>
            <Field label="Max Marks">
              <input
                type="number"
                value={form.maxMarks}
                onChange={(e) =>
                  setForm({ ...form, maxMarks: +e.target.value })
                }
              />
            </Field>
            <Field label="Passing Marks">
              <input
                type="number"
                value={form.passingMarks}
                onChange={(e) =>
                  setForm({ ...form, passingMarks: +e.target.value })
                }
              />
            </Field>
            <Field label="Assign to Classes" full>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  padding: "6px 0",
                }}
              >
                {classes.map((c) => (
                  <label
                    key={c._id}
                    style={{
                      display: "flex",
                      gap: 6,
                      alignItems: "center",
                      fontSize: 13,
                      textTransform: "none",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form.classIds.includes(c._id)}
                      onChange={() => toggleClass(c._id)}
                    />
                    {c.name} {c.section} ({c.academicYear})
                  </label>
                ))}
              </div>
            </Field>
          </div>
        </Modal>
      )}

      {confirmDel && (
        <Confirm
          message={`Delete subject "${confirmDel.name}"?`}
          onNo={() => setConfirmDel(null)}
          onYes={async () => {
            try {
              await api.delete(`/subjects/${confirmDel._id}`)
              notify("Subject deleted")
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

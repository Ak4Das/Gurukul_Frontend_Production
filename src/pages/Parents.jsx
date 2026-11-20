import { useEffect, useState } from "react"
import {
  UsersRound,
  Plus,
  Pencil,
  Trash2,
  GraduationCap,
  Link2,
} from "lucide-react"
import { api, errMsg } from "../api"
import { useApp } from "../context/AppContext"
import { useLookups, className } from "../hooks/useLookups"
import { DataTable, Field, Modal, Badge, Confirm } from "../components/ui"
import styles from "../style/Parents.module.css"

const EMPTY = {
  name: "",
  relation: "Father",
  mobile: "",
  email: "",
  occupation: "",
  address: "",
  status: "active",
}

export default function Parents() {
  const { notify, user } = useApp()
  const { students, classes, reload } = useLookups(["students", "classes"])
  const [rows, setRows] = useState([])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [confirmDel, setConfirmDel] = useState(null)
  const [linkStudentId, setLinkStudentId] = useState("")
  const canWrite = ["admin", "clerk", "supervisor"].includes(user?.role)

  const load = () => api.get("/parents").then(({ data }) => setRows(data))
  useEffect(() => {
    load()
  }, [])

  const childrenOf = (pid) =>
    students.filter((s) => (s.parentIds || []).includes(pid))

  const save = async () => {
    try {
      if (modal.data?._id) await api.put(`/parents/${modal.data._id}`, form)
      else await api.post("/parents", form)
      notify("Parent saved")
      setModal(null)
      load()
    } catch (e) {
      notify(errMsg(e), "error")
    }
  }

  const linkChild = async () => {
    try {
      const s = students.find((x) => x._id === linkStudentId)
      if (!s) return
      const parentIds = [...new Set([...(s.parentIds || []), modal.data._id])]
      await api.put(`/students/${s._id}`, { parentIds })
      notify(`Linked ${s.firstName} to ${modal.data.name}`)
      setLinkStudentId("")
      reload()
    } catch (e) {
      notify(errMsg(e), "error")
    }
  }

  const unlinkChild = async (s) => {
    try {
      await api.put(`/students/${s._id}`, {
        parentIds: (s.parentIds || []).filter((id) => id !== modal.data._id),
      })
      notify(`Unlinked ${s.firstName}`)
      reload()
    } catch (e) {
      notify(errMsg(e), "error")
    }
  }

  const columns = [
    { key: "name", label: "Parent", render: (r) => <b>{r.name}</b> },
    {
      key: "relation",
      label: "Relation",
      render: (r) => <Badge value={r.relation} color="bg-blue" />,
    },
    { key: "mobile", label: "Mobile" },
    { key: "email", label: "Email" },
    { key: "occupation", label: "Occupation" },
    {
      label: "Children",
      value: (r) => childrenOf(r._id).length,
      render: (r) => (
        <span
          className={`${styles.link_like}`}
          onClick={() => setModal({ type: "children", data: r })}
        >
          {childrenOf(r._id).length} linked
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => <Badge value={r.status} />,
    },
    {
      label: "Actions",
      sortable: false,
      noExport: true,
      render: (r) => (
        <div className={`${styles.row_actions}`}>
          <button
            className={`${styles.act_view}`}
            title="Linked children"
            onClick={() => setModal({ type: "children", data: r })}
          >
            <GraduationCap size={15} />
          </button>
          {canWrite && (
            <button
              className={`${styles.act_edit}`}
              title="Edit"
              onClick={() => {
                setForm({ ...EMPTY, ...r })
                setModal({ type: "form", data: r })
              }}
            >
              <Pencil size={15} />
            </button>
          )}
          {user?.role === "admin" && (
            <button
              className={`${styles.act_del}`}
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
      <div className={`${styles.page_head}`}>
        <h2>
          <UsersRound size={20} /> Parents Management
        </h2>
        <div className={`${styles.spacer}`} />
        {canWrite && (
          <button
            className={`${styles.btn} ${styles.btn_green}`}
            onClick={() => {
              setForm(EMPTY)
              setModal({ type: "form" })
            }}
          >
            <Plus size={15} /> Add Parent
          </button>
        )}
      </div>

      <p className={`${styles.muted} ${styles.small} ${styles.mb}`}>
        Parents are added automatically when a student is registered with parent
        details. You can also link multiple children to one parent so they see
        all siblings in a single dashboard.
      </p>

      <DataTable columns={columns} rows={rows} />

      {modal?.type === "form" && (
        <Modal
          title={modal.data ? "Edit Parent" : "Add Parent"}
          icon={UsersRound}
          onClose={() => setModal(null)}
          footer={
            <>
              <button className={`${styles.btn} ${styles.btn_gray}`} onClick={() => setModal(null)}>
                Cancel
              </button>
              <button className={`${styles.btn} ${styles.btn_green}`} onClick={save}>
                {modal.data ? "Update" : "Add"}
              </button>
            </>
          }
        >
          <div className={`${styles.form_grid}`}>
            <Field label="Name" required>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Field label="Relation">
              <select
                value={form.relation}
                onChange={(e) => setForm({ ...form, relation: e.target.value })}
              >
                <option>Father</option>
                <option>Mother</option>
                <option>Guardian</option>
              </select>
            </Field>
            <Field label="Mobile">
              <input
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              />
            </Field>
            <Field label="Email">
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>
            <Field label="Occupation">
              <input
                value={form.occupation}
                onChange={(e) =>
                  setForm({ ...form, occupation: e.target.value })
                }
              />
            </Field>
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option>active</option>
                <option>inactive</option>
              </select>
            </Field>
            <Field label="Address" full>
              <input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </Field>
          </div>
        </Modal>
      )}

      {modal?.type === "children" && (
        <Modal
          title={`Linked Children — ${modal.data.name}`}
          icon={GraduationCap}
          onClose={() => setModal(null)}
        >
          {childrenOf(modal.data._id).map((s) => (
            <div
              key={s._id}
              className={`${styles.card} ${styles.card_pad} ${styles.mb}`}
              style={{
                border: "1px solid var(--border)",
                boxShadow: "none",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span className={`${styles.badge} ${styles.bg_navy}`}>S</span>
              <div style={{ flex: 1 }}>
                <b>
                  {s.firstName} {s.lastName}
                </b>
                <div className={`${styles.small} ${styles.muted}`}>
                  {s.admissionNo} · {className(classes, s.classId)}
                </div>
              </div>
              {canWrite && (
                <button
                  className={`${styles.btn} ${styles.btn_xs} ${styles.btn_red}`}
                  onClick={() => unlinkChild(s)}
                >
                  Unlink
                </button>
              )}
            </div>
          ))}
          {childrenOf(modal.data._id).length === 0 && (
            <p className={`${styles.muted} ${styles.mb}`}>No children linked yet.</p>
          )}
          {canWrite && (
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "flex-end",
                marginTop: 10,
              }}
            >
              <Field label="Link another child">
                <select
                  value={linkStudentId}
                  onChange={(e) => setLinkStudentId(e.target.value)}
                >
                  <option value="">Select student…</option>
                  {students
                    .filter(
                      (s) => !(s.parentIds || []).includes(modal.data._id),
                    )
                    .map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.firstName} {s.lastName} ({s.admissionNo})
                      </option>
                    ))}
                </select>
              </Field>
              <button
                className={`${styles.btn} ${styles.btn_navy} ${styles.btn_sm}`}
                disabled={!linkStudentId}
                onClick={linkChild}
              >
                <Link2 size={14} /> Link
              </button>
            </div>
          )}
        </Modal>
      )}

      {confirmDel && (
        <Confirm
          message={`Delete parent "${confirmDel.name}"?`}
          onNo={() => setConfirmDel(null)}
          onYes={async () => {
            try {
              await api.delete(`/parents/${confirmDel._id}`)
              notify("Parent deleted")
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

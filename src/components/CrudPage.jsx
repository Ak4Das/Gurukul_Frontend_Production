import { useEffect, useMemo, useState } from "react"
import { Plus, Pencil, Trash2, Eye } from "lucide-react"
import { api, errMsg } from "../api"
import { useApp } from "../context/AppContext"
import { DataTable, StatusTabs, Field, Modal, Badge, Confirm } from "./ui"

/**
 * Config-driven CRUD page used by simpler modules.
 * cfg = {
 *   endpoint, title, icon, addLabel,
 *   writeRoles: [...],
 *   tabs: [{key,label,color, match(row)}] (optional; 'all' handled automatically)
 *   columns: DataTable columns
 *   fields: [{ name, label, type: 'text'|'number'|'date'|'select'|'textarea'|'checkbox', options, required, full, default }]
 *   viewFields: optional [(row)=>[label, value]] for the eye/view modal
 * }
 */
export default function CrudPage({ cfg, lookups = {} }) {
  const { notify, user } = useApp()
  const [rows, setRows] = useState([])
  const [tab, setTab] = useState("all")
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState({})
  const [confirmDel, setConfirmDel] = useState(null)
  const canWrite = !cfg.writeRoles || cfg.writeRoles.includes(user?.role)

  const load = () =>
    api
      .get(cfg.endpoint)
      .then(({ data }) => setRows(data))
      .catch((e) => notify(errMsg(e), "error"))
  useEffect(() => {
    load()
  }, [cfg.endpoint])

  const emptyForm = useMemo(() => {
    const f = {}
    for (const fld of cfg.fields)
      f[fld.name] = fld.default ?? (fld.type === "checkbox" ? false : "")
    return f
  }, [cfg])

  const filtered = useMemo(() => {
    if (tab === "all" || !cfg.tabs) return rows
    const t = cfg.tabs.find((x) => x.key === tab)
    return t?.match
      ? rows.filter(t.match)
      : rows.filter((r) => r.status === tab)
  }, [rows, tab, cfg])

  const save = async () => {
    try {
      if (modal.data?._id)
        await api.put(`${cfg.endpoint}/${modal.data._id}`, form)
      else await api.post(cfg.endpoint, form)
      notify("Saved successfully")
      setModal(null)
      load()
    } catch (e) {
      notify(errMsg(e), "error")
    }
  }

  const columns = [...cfg.columns]
  columns.push({
    label: "Actions",
    sortable: false,
    noExport: true,
    render: (r) => (
      <div className="row-actions">
        {cfg.viewFields && (
          <button
            className="act-view"
            title="View"
            onClick={() => setModal({ type: "view", data: r })}
          >
            <Eye size={15} />
          </button>
        )}
        {cfg.rowActions?.map((a, i) => (
          <button
            key={i}
            className={a.className || "act-navy"}
            title={a.title}
            onClick={() => a.onClick(r, { reload: load, notify })}
          >
            {a.icon}
          </button>
        ))}
        {canWrite && (
          <button
            className="act-edit"
            title="Edit"
            onClick={() => {
              setForm({ ...emptyForm, ...r })
              setModal({ type: "form", data: r })
            }}
          >
            <Pencil size={15} />
          </button>
        )}
        {canWrite && (
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
  })

  const Icon = cfg.icon

  return (
    <>
      <div className="page-head">
        <h2>
          {Icon && <Icon size={20} />} {cfg.title}
        </h2>
        <div className="spacer" />
        {canWrite && (
          <button
            className="btn btn-green"
            onClick={() => {
              setForm(emptyForm)
              setModal({ type: "form" })
            }}
          >
            <Plus size={15} /> {cfg.addLabel || "Add"}
          </button>
        )}
      </div>

      {cfg.tabs && (
        <StatusTabs
          active={tab}
          onChange={setTab}
          tabs={[
            { key: "all", label: "All", count: rows.length, color: "navy" },
            ...cfg.tabs.map((t) => ({
              ...t,
              count: (t.match
                ? rows.filter(t.match)
                : rows.filter((r) => r.status === t.key)
              ).length,
            })),
          ]}
        />
      )}

      <DataTable columns={columns} rows={filtered} />

      {modal?.type === "form" && (
        <Modal
          title={`${modal.data ? "Edit" : "Add"} — ${cfg.title}`}
          icon={Icon}
          onClose={() => setModal(null)}
          size={cfg.fields.length > 8 ? "lg" : undefined}
          footer={
            <>
              <button className="btn btn-gray" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button className="btn btn-green" onClick={save}>
                {modal.data ? "Update" : "Save"}
              </button>
            </>
          }
        >
          <div className="form-grid">
            {cfg.fields.map((f) => {
              if (f.section)
                return (
                  <div key={f.section} className="form-section">
                    {f.section}
                  </div>
                )
              const set = (v) => setForm((prev) => ({ ...prev, [f.name]: v }))
              const options =
                typeof f.options === "function" ? f.options(lookups) : f.options
              return (
                <Field
                  key={f.name}
                  label={f.label}
                  required={f.required}
                  full={f.full}
                  hint={f.hint}
                >
                  {f.type === "select" ? (
                    <select
                      value={form[f.name] ?? ""}
                      onChange={(e) => set(e.target.value)}
                    >
                      <option value="">Select…</option>
                      {(options || []).map((o) =>
                        typeof o === "object" ? (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ) : (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ),
                      )}
                    </select>
                  ) : f.type === "textarea" ? (
                    <textarea
                      rows={3}
                      value={form[f.name] ?? ""}
                      onChange={(e) => set(e.target.value)}
                    />
                  ) : f.type === "checkbox" ? (
                    <select
                      value={form[f.name] ? "yes" : "no"}
                      onChange={(e) => set(e.target.value === "yes")}
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  ) : (
                    <input
                      type={f.type || "text"}
                      value={form[f.name] ?? ""}
                      onChange={(e) =>
                        set(
                          f.type === "number"
                            ? e.target.valueAsNumber || e.target.value
                            : e.target.value,
                        )
                      }
                      placeholder={f.placeholder}
                    />
                  )}
                </Field>
              )
            })}
          </div>
        </Modal>
      )}

      {modal?.type === "view" && cfg.viewFields && (
        <Modal title={cfg.title} icon={Icon} onClose={() => setModal(null)}>
          <div className="form-grid">
            {cfg.viewFields(modal.data, lookups).map(([k, v]) => (
              <div
                key={k}
                className={`field ${String(v).length > 60 ? "full" : ""}`}
              >
                <label>{k}</label>
                <div style={{ fontWeight: 600, whiteSpace: "pre-wrap" }}>
                  {v || "—"}
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {confirmDel && (
        <Confirm
          message="Delete this record? This cannot be undone."
          onNo={() => setConfirmDel(null)}
          onYes={async () => {
            try {
              await api.delete(`${cfg.endpoint}/${confirmDel._id}`)
              notify("Deleted")
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

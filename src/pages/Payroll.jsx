import { useEffect, useMemo, useState } from "react"
import {
  Plus,
  Printer,
  BadgeIndianRupee,
  Trash2,
  Wallet,
  CheckCircle2,
  X,
} from "lucide-react"
import { api, errMsg } from "../api"
import { useApp } from "../context/AppContext"
import {
  DataTable,
  Modal,
  Field,
  Badge,
  InfoCard,
  Confirm,
} from "../components/ui"
import styles from "../style/Payroll.module.css"

const emptyRow = () => ({ name: "", amount: "" })
const FORM_INIT = {
  staffId: "",
  month: new Date().toISOString().slice(0, 7),
  basicSalary: "",
  workingDays: 26,
  presentDays: 26,
  allowances: [
    { name: "HRA", amount: "" },
    { name: "Transport Allowance", amount: "" },
  ],
  deductions: [
    { name: "Provident Fund", amount: "" },
    { name: "Professional Tax", amount: "" },
  ],
}

export default function Payroll() {
  const { user, settings, notify } = useApp()
  const cur = settings.currency || "₹"
  const isPayrollAdmin = ["admin", "clerk"].includes(user?.role)
  const [slips, setSlips] = useState([])
  const [staff, setStaff] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [printSlip, setPrintSlip] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [form, setForm] = useState(FORM_INIT)

  const load = () => api.get("/payroll").then(({ data }) => setSlips(data))
  useEffect(() => {
    load()
    if (isPayrollAdmin) {
      api
        .get("/users")
        .then(({ data }) =>
          setStaff(
            data.filter((u) =>
              ["teacher", "clerk", "supervisor", "admin"].includes(u.role),
            ),
          ),
        )
    }
  }, [])

  const netPreview = useMemo(
    () =>
      (Number(form.basicSalary) || 0) +
      form.allowances.reduce((s, a) => s + (Number(a.amount) || 0), 0) -
      form.deductions.reduce((s, d) => s + (Number(d.amount) || 0), 0),
    [form],
  )

  const setRow = (kind, i, key, val) =>
    setForm({
      ...form,
      [kind]: form[kind].map((r, idx) =>
        idx === i ? { ...r, [key]: val } : r,
      ),
    })

  const generate = async () => {
    try {
      await api.post("/payroll", {
        ...form,
        allowances: form.allowances.filter((a) => a.name && a.amount),
        deductions: form.deductions.filter((d) => d.name && d.amount),
      })
      notify("Salary slip generated")
      setShowForm(false)
      setForm(FORM_INIT)
      load()
    } catch (err) {
      notify(errMsg(err), "error")
    }
  }

  const doConfirm = async () => {
    const c = confirm
    setConfirm(null)
    try {
      if (c.type === "pay") {
        await api.post(`/payroll/${c.slip._id}/pay`, { mode: "online" })
        notify(
          `${c.slip.slipNo} marked paid — expense posted to Daily Accounts`,
        )
      } else {
        await api.delete(`/payroll/${c.slip._id}`)
        notify("Slip deleted")
      }
      load()
    } catch (err) {
      notify(errMsg(err), "error")
    }
  }

  const paid = slips.filter((s) => s.status === "paid")

  const columns = [
    { key: "slipNo", label: "Slip No" },
    { key: "staffName", label: "Staff" },
    { key: "designation", label: "Designation" },
    { key: "month", label: "Month" },
    {
      key: "basicSalary",
      label: "Basic",
      render: (r) => `${cur}${(r.basicSalary || 0).toLocaleString()}`,
    },
    {
      key: "netPay",
      label: "Net Pay",
      render: (r) => (
        <b>
          {cur}
          {(r.netPay || 0).toLocaleString()}
        </b>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <Badge
          value={r.status}
          color={r.status === "paid" ? "bg-green" : "bg-yellow"}
        />
      ),
    },
    {
      key: "_act",
      label: "Actions",
      sortable: false,
      render: (r) => (
        <div className={`${styles.row_actions}`}>
          <button
            className={`${styles.act_view}`}
            title="View / Print slip"
            onClick={() => setPrintSlip(r)}
          >
            <Printer size={15} />
          </button>
          {isPayrollAdmin && r.status !== "paid" && (
            <button
              className={`${styles.act_green}`}
              title="Mark paid"
              onClick={() => setConfirm({ type: "pay", slip: r })}
            >
              <Wallet size={15} />
            </button>
          )}
          {user?.role === "admin" && (
            <button
              className={`${styles.act_del}`}
              title="Delete"
              onClick={() => setConfirm({ type: "del", slip: r })}
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
          <BadgeIndianRupee size={20} /> Payroll / Salary Slips
        </h2>
        <div className={`${styles.spacer}`} />
        {isPayrollAdmin && (
          <button className={`${styles.btn} ${styles.btn_green}`} onClick={() => setShowForm(true)}>
            <Plus size={15} /> Generate Slip
          </button>
        )}
      </div>

      <div
        className={`${styles.kpi_grid}`}
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}
      >
        <InfoCard
          color="navy"
          icon={BadgeIndianRupee}
          value={slips.length}
          label="Total Slips"
        />
        <InfoCard
          color="green"
          icon={CheckCircle2}
          value={paid.length}
          label="Paid"
        />
        <InfoCard
          color="orange"
          icon={Wallet}
          value={slips.length - paid.length}
          label="Pending Payment"
        />
        <InfoCard
          color="teal"
          icon={Wallet}
          value={`${cur}${paid.reduce((s, x) => s + (x.netPay || 0), 0).toLocaleString()}`}
          label="Total Disbursed"
        />
      </div>

      <DataTable columns={columns} rows={slips} />

      {showForm && (
        <Modal
          title="Generate Salary Slip"
          icon={BadgeIndianRupee}
          size="lg"
          onClose={() => setShowForm(false)}
          footer={
            <>
              <button
                className={`${styles.btn} ${styles.btn_gray}`}
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button className={`${styles.btn} ${styles.btn_green}`} onClick={generate}>
                Generate Slip
              </button>
            </>
          }
        >
          <div className={`${styles.form_grid}`}>
            <Field label="Staff Member" required>
              <select
                value={form.staffId}
                onChange={(e) => setForm({ ...form, staffId: e.target.value })}
              >
                <option value="">— Select staff —</option>
                {staff.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.fullName} ({s.role})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Salary Month" required>
              <input
                type="month"
                value={form.month}
                onChange={(e) => setForm({ ...form, month: e.target.value })}
              />
            </Field>
            <Field label="Basic Salary" required>
              <input
                type="number"
                min="0"
                value={form.basicSalary}
                onChange={(e) =>
                  setForm({ ...form, basicSalary: e.target.value })
                }
              />
            </Field>
            <Field label="Working Days">
              <input
                type="number"
                min="0"
                max="31"
                value={form.workingDays}
                onChange={(e) =>
                  setForm({ ...form, workingDays: e.target.value })
                }
              />
            </Field>
            <Field label="Present Days">
              <input
                type="number"
                min="0"
                max="31"
                value={form.presentDays}
                onChange={(e) =>
                  setForm({ ...form, presentDays: e.target.value })
                }
              />
            </Field>
          </div>

          {["allowances", "deductions"].map((kind) => (
            <div key={kind} className={`${styles.mt}`}>
              <div
                className={`${styles.card_title}`}
                style={{ textTransform: "capitalize" }}
              >
                {kind}
              </div>
              {form[kind].map((row, i) => (
                <div
                  key={i}
                  style={{ display: "flex", gap: 8, marginBottom: 7 }}
                >
                  <input
                    placeholder="Name (e.g. HRA)"
                    value={row.name}
                    onChange={(e) => setRow(kind, i, "name", e.target.value)}
                    style={{ flex: 2 }}
                  />
                  <input
                    placeholder="Amount"
                    type="number"
                    min="0"
                    value={row.amount}
                    onChange={(e) => setRow(kind, i, "amount", e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className={`${styles.act_del}`}
                    onClick={() =>
                      setForm({
                        ...form,
                        [kind]: form[kind].filter((_, idx) => idx !== i),
                      })
                    }
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className={`${styles.btn} ${styles.btn_sm} ${styles.btn_gray}`}
                onClick={() =>
                  setForm({ ...form, [kind]: [...form[kind], emptyRow()] })
                }
              >
                <Plus size={12} /> Add{" "}
                {kind === "allowances" ? "Allowance" : "Deduction"}
              </button>
            </div>
          ))}

          <div
            className={`${styles.card} ${styles.card_pad} ${styles.mt}`}
            style={{
              background: "var(--hover)",
              display: "flex",
              justifyContent: "space-between",
              boxShadow: "none",
            }}
          >
            <b>Net Pay Preview</b>
            <b className={`${styles.txt_green}`} style={{ fontSize: 18 }}>
              {cur}
              {netPreview.toLocaleString()}
            </b>
          </div>
        </Modal>
      )}

      {printSlip && (
        <Modal
          title={`Salary Slip — ${printSlip.slipNo}`}
          icon={Printer}
          size="lg"
          onClose={() => setPrintSlip(null)}
          footer={
            <>
              <button
                className={`${styles.btn} ${styles.btn_gray}`}
                onClick={() => setPrintSlip(null)}
              >
                Close
              </button>
              <button className={`${styles.btn} ${styles.btn_navy}`} onClick={() => window.print()}>
                <Printer size={15} /> Print
              </button>
            </>
          }
        >
          <div className={`${styles.doc_a4} ${styles.print_area}`}>
            <div style={{ textAlign: "center" }}>
              <h1>{settings.schoolName}</h1>
              <div className={`${styles.small}`}>
                {settings.address} · {settings.phone}
              </div>
            </div>
            <div className={`${styles.band}`}>SALARY SLIP — {printSlip.month}</div>
            <table style={{ marginBottom: 14 }}>
              <tbody>
                <tr>
                  <td>
                    <b>Employee:</b> {printSlip.staffName}
                  </td>
                  <td>
                    <b>Designation:</b> {printSlip.designation}
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>Slip No:</b> {printSlip.slipNo}
                  </td>
                  <td>
                    <b>Attendance:</b> {printSlip.presentDays}/
                    {printSlip.workingDays} days
                  </td>
                </tr>
                <tr>
                  <td>
                    <b>Status:</b> {printSlip.status}
                    {printSlip.paidOn ? ` on ${printSlip.paidOn}` : ""}
                  </td>
                  <td>
                    <b>Payment Mode:</b> {printSlip.mode || "—"}
                  </td>
                </tr>
              </tbody>
            </table>
            <table className={`${styles.lines}`}>
              <thead>
                <tr>
                  <th>Earnings</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th>Deductions</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({
                  length: Math.max(
                    printSlip.allowances.length + 1,
                    printSlip.deductions.length,
                  ),
                }).map((_, i) => {
                  const earn =
                    i === 0
                      ? { name: "Basic Salary", amount: printSlip.basicSalary }
                      : printSlip.allowances[i - 1]
                  const ded = printSlip.deductions[i]
                  return (
                    <tr key={i}>
                      <td>{earn?.name || ""}</td>
                      <td style={{ textAlign: "right" }}>
                        {earn ? `${cur}${earn.amount.toLocaleString()}` : ""}
                      </td>
                      <td>{ded?.name || ""}</td>
                      <td style={{ textAlign: "right" }}>
                        {ded ? `${cur}${ded.amount.toLocaleString()}` : ""}
                      </td>
                    </tr>
                  )
                })}
                <tr style={{ fontWeight: 700 }}>
                  <td>Gross Earnings</td>
                  <td style={{ textAlign: "right" }}>
                    {cur}
                    {printSlip.gross.toLocaleString()}
                  </td>
                  <td>Total Deductions</td>
                  <td style={{ textAlign: "right" }}>
                    {cur}
                    {printSlip.totalDeductions.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className={`${styles.band}`} style={{ background: "#15803d" }}>
              NET PAY: {cur}
              {printSlip.netPay.toLocaleString()}
            </div>
            <div className={`${styles.sig_row}`}>
              <span>Employee Signature</span>
              <span>Accounts Officer</span>
              <span>Principal</span>
            </div>
          </div>
        </Modal>
      )}

      {confirm && (
        <Confirm
          title={confirm.type === "pay" ? "Mark as Paid?" : "Delete Slip?"}
          message={
            confirm.type === "pay"
              ? `Pay ${confirm.slip.staffName} ${cur}${confirm.slip.netPay.toLocaleString()} for ${confirm.slip.month}? An expense entry will be posted to Daily Accounts.`
              : `Delete slip ${confirm.slip.slipNo}? This cannot be undone.`
          }
          danger={confirm.type !== "pay"}
          yesLabel={confirm.type === "pay" ? "Yes, Mark Paid" : "Yes, Delete"}
          onNo={() => setConfirm(null)}
          onYes={doConfirm}
        />
      )}
    </>
  )
}

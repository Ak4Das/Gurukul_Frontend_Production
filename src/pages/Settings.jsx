import { useEffect, useState } from "react"
import {
  Settings as SettingsIcon,
  Save,
  Palette,
  Building2,
} from "lucide-react"
import { api, errMsg } from "../api"
import { useApp } from "../context/AppContext"
import { Field } from "../components/ui"

const PRESETS = [
  { name: "Navy (Default)", primary: "#0f2248", accent: "#16a34a" },
  { name: "Royal Blue", primary: "#1e3a8a", accent: "#f59e0b" },
  { name: "Forest", primary: "#14532d", accent: "#f97316" },
  { name: "Maroon", primary: "#7f1d1d", accent: "#0ea5e9" },
  { name: "Plum", primary: "#4c1d95", accent: "#10b981" },
  { name: "Charcoal", primary: "#1f2937", accent: "#ef4444" },
]

export default function Settings() {
  const { notify, loadSettings } = useApp()
  const [form, setForm] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.get("/settings").then(({ data }) =>
      setForm({
        schoolName: "",
        tagline: "",
        address: "",
        phone: "",
        email: "",
        website: "",
        timezone: "Asia/Kolkata",
        currency: "₹",
        academicYear: "2024-2025",
        logoUrl: "",
        primaryColor: "#0f2248",
        accentColor: "#16a34a",
        ...data,
      }),
    )
  }, [])

  if (!form) return <div className="card card-pad">Loading settings…</div>

  const save = async () => {
    setBusy(true)
    try {
      await api.put("/settings", form)
      await loadSettings()
      notify("Settings saved — theme applied")
    } catch (e) {
      notify(errMsg(e), "error")
    }
    setBusy(false)
  }

  return (
    <>
      <div className="page-head">
        <h2>
          <SettingsIcon size={20} /> Settings
        </h2>
        <div className="spacer" />
        <button className="btn btn-green" disabled={busy} onClick={save}>
          <Save size={15} /> Save Settings
        </button>
      </div>

      <div className="grid-2">
        <div className="card card-pad">
          <div className="card-title">
            <Building2 size={15} /> School Information
          </div>
          <div style={{ display: "grid", gap: 12 }}>
            <Field label="School Name" required>
              <input
                value={form.schoolName}
                onChange={(e) =>
                  setForm({ ...form, schoolName: e.target.value })
                }
              />
            </Field>
            <Field label="Tagline">
              <input
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              />
            </Field>
            <Field label="Address">
              <textarea
                rows={2}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </Field>
            <div className="form-grid">
              <Field label="Phone">
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </Field>
              <Field label="Email">
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>
              <Field label="Website">
                <input
                  value={form.website}
                  onChange={(e) =>
                    setForm({ ...form, website: e.target.value })
                  }
                />
              </Field>
              <Field label="Logo URL">
                <input
                  value={form.logoUrl}
                  onChange={(e) =>
                    setForm({ ...form, logoUrl: e.target.value })
                  }
                />
              </Field>
              <Field label="Time Zone">
                <select
                  value={form.timezone}
                  onChange={(e) =>
                    setForm({ ...form, timezone: e.target.value })
                  }
                >
                  {[
                    "Asia/Kolkata",
                    "Asia/Karachi",
                    "Asia/Dubai",
                    "Asia/Singapore",
                    "Europe/London",
                    "America/New_York",
                  ].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <Field label="Currency Symbol">
                <input
                  value={form.currency}
                  onChange={(e) =>
                    setForm({ ...form, currency: e.target.value })
                  }
                />
              </Field>
              <Field label="Academic Year">
                <input
                  value={form.academicYear}
                  onChange={(e) =>
                    setForm({ ...form, academicYear: e.target.value })
                  }
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="card card-pad">
          <div className="card-title">
            <Palette size={15} /> Theme & Colors
          </div>
          <p className="small muted mb">
            Change the primary and accent colors of the entire application to
            match your school branding.
          </p>
          <div className="form-grid">
            <Field label="Primary Color">
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="color"
                  value={form.primaryColor}
                  style={{ width: 46, height: 34, padding: 2 }}
                  onChange={(e) =>
                    setForm({ ...form, primaryColor: e.target.value })
                  }
                />
                <input
                  value={form.primaryColor}
                  onChange={(e) =>
                    setForm({ ...form, primaryColor: e.target.value })
                  }
                />
              </div>
            </Field>
            <Field label="Accent Color">
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="color"
                  value={form.accentColor}
                  style={{ width: 46, height: 34, padding: 2 }}
                  onChange={(e) =>
                    setForm({ ...form, accentColor: e.target.value })
                  }
                />
                <input
                  value={form.accentColor}
                  onChange={(e) =>
                    setForm({ ...form, accentColor: e.target.value })
                  }
                />
              </div>
            </Field>
          </div>
          <div className="card-title mt">Presets</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PRESETS.map((p) => (
              <button
                key={p.name}
                className="btn btn-sm btn-gray"
                onClick={() =>
                  setForm({
                    ...form,
                    primaryColor: p.primary,
                    accentColor: p.accent,
                  })
                }
              >
                <span
                  style={{
                    width: 13,
                    height: 13,
                    borderRadius: 3,
                    background: p.primary,
                    display: "inline-block",
                  }}
                />
                <span
                  style={{
                    width: 13,
                    height: 13,
                    borderRadius: 3,
                    background: p.accent,
                    display: "inline-block",
                  }}
                />
                {p.name}
              </button>
            ))}
          </div>
          <div
            className="mt"
            style={{
              background: form.primaryColor,
              color: "#fff",
              borderRadius: 8,
              padding: 16,
            }}
          >
            <b>Preview:</b> Sidebar / headers use this primary color.
            <button
              className="btn btn-sm"
              style={{
                background: form.accentColor,
                color: "#fff",
                marginLeft: 10,
              }}
            >
              Accent Button
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

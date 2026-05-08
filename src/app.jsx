import { useState, useEffect, useRef } from "react";

// ─── DUMMY DATA ───────────────────────────────────────────────────────────────
const PATIENTS = [
  { id: "P001", name: "Arjun Mehta", age: 34, gender: "Male", blood: "B+", phone: "+91 98765 43210", condition: "Hypertension", status: "Active", ward: "Cardiology", admitDate: "2026-04-12", doctor: "Dr. Priya Sharma", avatar: "AM" },
  { id: "P002", name: "Sneha Iyer", age: 27, gender: "Female", blood: "O+", phone: "+91 87654 32109", condition: "Diabetes Type 2", status: "Active", ward: "Endocrinology", admitDate: "2026-04-28", doctor: "Dr. Rakesh Nair", avatar: "SI" },
  { id: "P003", name: "Vikram Rao", age: 52, gender: "Male", blood: "A−", phone: "+91 76543 21098", condition: "Post-Op Recovery", status: "Critical", ward: "ICU", admitDate: "2026-05-01", doctor: "Dr. Meena Pillai", avatar: "VR" },
  { id: "P004", name: "Kavya Nair", age: 19, gender: "Female", blood: "AB+", phone: "+91 65432 10987", condition: "Fracture - Left Femur", status: "Stable", ward: "Orthopedics", admitDate: "2026-05-03", doctor: "Dr. Suresh Menon", avatar: "KN" },
  { id: "P005", name: "Rajan Thomas", age: 61, gender: "Male", blood: "O−", phone: "+91 54321 09876", condition: "Pneumonia", status: "Active", ward: "Pulmonology", admitDate: "2026-04-30", doctor: "Dr. Priya Sharma", avatar: "RT" },
  { id: "P006", name: "Divya Krishnan", age: 44, gender: "Female", blood: "B−", phone: "+91 43210 98765", condition: "Migraine Chronic", status: "Stable", ward: "Neurology", admitDate: "2026-05-05", doctor: "Dr. Meena Pillai", avatar: "DK" },
  { id: "P007", name: "Anil Gupta", age: 38, gender: "Male", blood: "A+", phone: "+91 32109 87654", condition: "Appendicitis", status: "Discharged", ward: "Surgery", admitDate: "2026-04-25", doctor: "Dr. Rakesh Nair", avatar: "AG" },
  { id: "P008", name: "Pooja Verma", age: 29, gender: "Female", blood: "O+", phone: "+91 21098 76543", condition: "Anemia", status: "Active", ward: "Hematology", admitDate: "2026-05-06", doctor: "Dr. Suresh Menon", avatar: "PV" },
];

const APPOINTMENTS = [
  { id: "A001", patient: "Arjun Mehta", patientId: "P001", doctor: "Dr. Priya Sharma", dept: "Cardiology", date: "2026-05-08", time: "09:00", type: "Follow-up", status: "Confirmed", duration: 30, notes: "BP check + ECG" },
  { id: "A002", patient: "Latha Subramanian", patientId: "P009", doctor: "Dr. Meena Pillai", dept: "Neurology", date: "2026-05-08", time: "10:30", type: "Consultation", status: "Pending", duration: 45, notes: "MRI review" },
  { id: "A003", patient: "Sneha Iyer", patientId: "P002", doctor: "Dr. Rakesh Nair", dept: "Endocrinology", date: "2026-05-08", time: "11:00", type: "Routine", status: "Confirmed", duration: 20, notes: "HbA1c results" },
  { id: "A004", patient: "Mohan Das", patientId: "P010", doctor: "Dr. Suresh Menon", dept: "Orthopedics", date: "2026-05-09", time: "09:30", type: "Emergency", status: "Confirmed", duration: 60, notes: "X-Ray post reduction" },
  { id: "A005", patient: "Kavya Nair", patientId: "P004", doctor: "Dr. Suresh Menon", dept: "Orthopedics", date: "2026-05-09", time: "11:30", type: "Follow-up", status: "Pending", duration: 30, notes: "Cast removal check" },
  { id: "A006", patient: "Rajan Thomas", patientId: "P005", doctor: "Dr. Priya Sharma", dept: "Pulmonology", date: "2026-05-10", time: "14:00", type: "Follow-up", status: "Cancelled", duration: 30, notes: "Chest X-Ray review" },
  { id: "A007", patient: "Preethi Bose", patientId: "P011", doctor: "Dr. Meena Pillai", dept: "Neurology", date: "2026-05-10", time: "15:00", type: "Consultation", status: "Confirmed", duration: 45, notes: "Seizure assessment" },
  { id: "A008", patient: "Divya Krishnan", patientId: "P006", doctor: "Dr. Meena Pillai", dept: "Neurology", date: "2026-05-11", time: "10:00", type: "Routine", status: "Confirmed", duration: 20, notes: "Medication review" },
];

const DOCTORS = ["Dr. Priya Sharma", "Dr. Rakesh Nair", "Dr. Meena Pillai", "Dr. Suresh Menon"];
const DEPARTMENTS = ["Cardiology", "Neurology", "Endocrinology", "Orthopedics", "Pulmonology", "ICU", "Surgery", "Hematology"];

// ─── UTILITY FUNCTIONS ────────────────────────────────────────────────────────
const getStatusColor = (status) => ({
  Active: { bg: "#e8f5e9", text: "#2e7d32", dot: "#43a047" },
  Critical: { bg: "#fce4ec", text: "#c62828", dot: "#e53935" },
  Stable: { bg: "#e3f2fd", text: "#1565c0", dot: "#1e88e5" },
  Discharged: { bg: "#f3e5f5", text: "#6a1b9a", dot: "#8e24aa" },
  Confirmed: { bg: "#e8f5e9", text: "#2e7d32", dot: "#43a047" },
  Pending: { bg: "#fff8e1", text: "#f57f17", dot: "#ffb300" },
  Cancelled: { bg: "#ffebee", text: "#b71c1c", dot: "#e53935" },
}[status] || { bg: "#f5f5f5", text: "#616161", dot: "#9e9e9e" });

const getTypeColor = (type) => ({
  Emergency: "#ff5252",
  Consultation: "#7c4dff",
  "Follow-up": "#00bcd4",
  Routine: "#69c0a1",
}[type] || "#9e9e9e");

const filterPatients = (patients, search, filter) =>
  patients.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()) || p.condition.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || p.status === filter;
    return matchSearch && matchFilter;
  });

const filterAppointments = (appts, search, filter, dateFilter) =>
  appts.filter(a => {
    const matchSearch = !search || a.patient.toLowerCase().includes(search.toLowerCase()) || a.doctor.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || a.status === filter;
    const matchDate = !dateFilter || a.date === dateFilter;
    return matchSearch && matchFilter && matchDate;
  });

const getStats = (patients) => ({
  total: patients.length,
  active: patients.filter(p => p.status === "Active").length,
  critical: patients.filter(p => p.status === "Critical").length,
  discharged: patients.filter(p => p.status === "Discharged").length,
});

const getApptStats = (appts) => ({
  total: appts.length,
  confirmed: appts.filter(a => a.status === "Confirmed").length,
  pending: appts.filter(a => a.status === "Pending").length,
  cancelled: appts.filter(a => a.status === "Cancelled").length,
});

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color, sub }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", border: "1px solid #f0f0f0", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 140 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#0f1923", fontFamily: "'DM Sans', sans-serif", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: "#8a94a6", fontWeight: 500, marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: color, fontWeight: 600, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function Badge({ status }) {
  const c = getStatusColor(status);
  return (
    <span style={{ background: c.bg, color: c.text, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "'DM Sans', sans-serif" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, display: "inline-block" }} />
      {status}
    </span>
  );
}

function Avatar({ initials, size = 36, color }) {
  const colors = ["#5b4fcf", "#e07b39", "#2e9c6e", "#c94040", "#2563eb", "#7c3aed"];
  const idx = initials.charCodeAt(0) % colors.length;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: color || colors[idx], color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size * 0.36, fontFamily: "'DM Sans', sans-serif", flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,15,25,0.55)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 520, boxShadow: "0 24px 80px rgba(0,0,0,0.2)", overflow: "hidden", animation: "modalIn 0.22s ease" }}>
        <div style={{ padding: "20px 28px 16px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "#0f1923" }}>{title}</span>
          <button onClick={onClose} style={{ background: "#f5f5f5", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#666", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
        <div style={{ padding: "24px 28px" }}>{children}</div>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#5a6270", marginBottom: 6, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.04em" }}>{label}</label>}
      <input {...props} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e8ecf0", fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: "#0f1923", outline: "none", boxSizing: "border-box", background: "#fafbfc", transition: "border-color 0.2s", ...(props.style || {}) }} onFocus={e => e.target.style.borderColor = "#5b4fcf"} onBlur={e => e.target.style.borderColor = "#e8ecf0"} />
    </div>
  );
}

function Select({ label, options, ...props }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#5a6270", marginBottom: 6, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.04em" }}>{label}</label>}
      <select {...props} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e8ecf0", fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: "#0f1923", outline: "none", background: "#fafbfc", cursor: "pointer" }}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ─── PATIENT DETAIL MODAL ─────────────────────────────────────────────────────
function PatientDetail({ patient, onClose }) {
  if (!patient) return null;
  const fields = [
    ["Patient ID", patient.id], ["Age", patient.age + " years"], ["Gender", patient.gender],
    ["Blood Group", patient.blood], ["Phone", patient.phone], ["Ward", patient.ward],
    ["Admit Date", patient.admitDate], ["Doctor", patient.doctor],
  ];
  return (
    <Modal title="Patient Details" onClose={onClose}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, padding: "16px", background: "#f8f9fe", borderRadius: 12 }}>
        <Avatar initials={patient.avatar} size={52} />
        <div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "#0f1923" }}>{patient.name}</div>
          <div style={{ fontSize: 13, color: "#8a94a6", marginTop: 2, fontFamily: "'DM Sans', sans-serif" }}>{patient.condition}</div>
          <div style={{ marginTop: 6 }}><Badge status={patient.status} /></div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px" }}>
        {fields.map(([k, v]) => (
          <div key={k}>
            <div style={{ fontSize: 11, color: "#aab0bb", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.05em" }}>{k}</div>
            <div style={{ fontSize: 14, color: "#0f1923", fontWeight: 500, fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>{v}</div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

// ─── ADD PATIENT MODAL ────────────────────────────────────────────────────────
function AddPatientModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: "", age: "", gender: "Male", blood: "O+", phone: "", condition: "", ward: "Cardiology", doctor: DOCTORS[0] });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = () => {
    if (!form.name || !form.age || !form.condition) return alert("Fill required fields");
    const initials = form.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    onAdd({ ...form, id: "P" + String(Date.now()).slice(-3), status: "Active", admitDate: new Date().toISOString().slice(0, 10), avatar: initials });
    onClose();
  };
  return (
    <Modal title="Add New Patient" onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <div style={{ gridColumn: "1/-1" }}><Input label="Full Name *" placeholder="e.g. Rajesh Kumar" value={form.name} onChange={e => set("name", e.target.value)} /></div>
        <Input label="Age *" type="number" placeholder="34" value={form.age} onChange={e => set("age", e.target.value)} />
        <Select label="Gender" options={["Male", "Female", "Other"]} value={form.gender} onChange={e => set("gender", e.target.value)} />
        <Select label="Blood Group" options={["A+", "A−", "B+", "B−", "O+", "O−", "AB+", "AB−"]} value={form.blood} onChange={e => set("blood", e.target.value)} />
        <Input label="Phone" placeholder="+91 98xxx" value={form.phone} onChange={e => set("phone", e.target.value)} />
        <div style={{ gridColumn: "1/-1" }}><Input label="Condition / Diagnosis *" placeholder="e.g. Hypertension" value={form.condition} onChange={e => set("condition", e.target.value)} /></div>
        <Select label="Ward" options={DEPARTMENTS} value={form.ward} onChange={e => set("ward", e.target.value)} />
        <Select label="Assigned Doctor" options={DOCTORS} value={form.doctor} onChange={e => set("doctor", e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <button onClick={onClose} style={{ padding: "10px 22px", borderRadius: 10, border: "1.5px solid #e8ecf0", background: "#fff", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, color: "#666" }}>Cancel</button>
        <button onClick={submit} style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #5b4fcf, #7c6ef5)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: "#fff" }}>Add Patient</button>
      </div>
    </Modal>
  );
}

// ─── ADD APPOINTMENT MODAL ────────────────────────────────────────────────────
function AddApptModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ patient: "", doctor: DOCTORS[0], dept: "Cardiology", date: "2026-05-12", time: "09:00", type: "Consultation", notes: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = () => {
    if (!form.patient || !form.date) return alert("Fill required fields");
    onAdd({ ...form, id: "A" + String(Date.now()).slice(-3), status: "Pending", duration: 30, patientId: "P-new" });
    onClose();
  };
  return (
    <Modal title="Schedule Appointment" onClose={onClose}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
        <div style={{ gridColumn: "1/-1" }}><Input label="Patient Name *" placeholder="e.g. Anita Reddy" value={form.patient} onChange={e => set("patient", e.target.value)} /></div>
        <Select label="Doctor" options={DOCTORS} value={form.doctor} onChange={e => set("doctor", e.target.value)} />
        <Select label="Department" options={DEPARTMENTS} value={form.dept} onChange={e => set("dept", e.target.value)} />
        <Input label="Date *" type="date" value={form.date} onChange={e => set("date", e.target.value)} />
        <Input label="Time" type="time" value={form.time} onChange={e => set("time", e.target.value)} />
        <div style={{ gridColumn: "1/-1" }}><Select label="Type" options={["Consultation", "Follow-up", "Routine", "Emergency"]} value={form.type} onChange={e => set("type", e.target.value)} /></div>
        <div style={{ gridColumn: "1/-1" }}><Input label="Notes" placeholder="Brief description..." value={form.notes} onChange={e => set("notes", e.target.value)} /></div>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <button onClick={onClose} style={{ padding: "10px 22px", borderRadius: 10, border: "1.5px solid #e8ecf0", background: "#fff", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14, color: "#666" }}>Cancel</button>
        <button onClick={submit} style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #2e9c6e, #43c99a)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, color: "#fff" }}>Schedule</button>
      </div>
    </Modal>
  );
}

// ─── PATIENTS MODULE ──────────────────────────────────────────────────────────
function PatientsModule() {
  const [patients, setPatients] = useState(PATIENTS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const stats = getStats(patients);
  const filtered = filterPatients(patients, search, filter);

  return (
    <div style={{ padding: "0 0 32px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 700, color: "#0f1923", margin: 0, lineHeight: 1.2 }}>Patient Management</h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#8a94a6", marginTop: 6 }}>Track & manage all hospital patients</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ padding: "11px 22px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #5b4fcf, #7c6ef5)", color: "#fff", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 14px rgba(91,79,207,0.35)" }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add Patient
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
        <StatCard label="Total Patients" value={stats.total} icon="🏥" color="#5b4fcf" />
        <StatCard label="Active" value={stats.active} icon="💊" color="#43a047" sub="In ward" />
        <StatCard label="Critical" value={stats.critical} icon="🚨" color="#e53935" sub="Needs attention" />
        <StatCard label="Discharged" value={stats.discharged} icon="✅" color="#8e24aa" />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔍</span>
          <input placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", padding: "10px 14px 10px 38px", borderRadius: 10, border: "1.5px solid #e8ecf0", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", background: "#fafbfc", boxSizing: "border-box" }} />
        </div>
        {["All", "Active", "Critical", "Stable", "Discharged"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "9px 18px", borderRadius: 10, border: "1.5px solid " + (filter === f ? "#5b4fcf" : "#e8ecf0"), background: filter === f ? "#5b4fcf" : "#fff", color: filter === f ? "#fff" : "#5a6270", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13, transition: "all 0.2s" }}>
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0f0f0", overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "50px 2fr 1fr 1fr 1.2fr 1fr 1fr", padding: "12px 20px", background: "#f8f9fe", borderBottom: "1px solid #f0f0f0" }}>
          {["#", "Patient", "Ward", "Blood", "Doctor", "Admit Date", "Status"].map(h => (
            <span key={h} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 700, color: "#aab0bb", letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</span>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#aab0bb", fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>No patients found</div>
        ) : filtered.map((p, i) => (
          <div key={p.id} onClick={() => setSelected(p)} style={{ display: "grid", gridTemplateColumns: "50px 2fr 1fr 1fr 1.2fr 1fr 1fr", padding: "14px 20px", borderBottom: i < filtered.length - 1 ? "1px solid #f5f5f5" : "none", alignItems: "center", cursor: "pointer", transition: "background 0.15s" }} onMouseEnter={e => e.currentTarget.style.background = "#f8f9fe"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#c4c8d0", fontWeight: 600 }}>{String(i + 1).padStart(2, "0")}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Avatar initials={p.avatar} size={34} />
              <div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: "#0f1923" }}>{p.name}</div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#8a94a6" }}>{p.id} · {p.age}y · {p.gender}</div>
              </div>
            </div>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#5a6270" }}>{p.ward}</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#5b4fcf", fontWeight: 600 }}>{p.blood}</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#5a6270" }}>{p.doctor}</span>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#8a94a6" }}>{p.admitDate}</span>
            <Badge status={p.status} />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#aab0bb", textAlign: "right" }}>Showing {filtered.length} of {patients.length} patients · Click row to view details</div>

      {selected && <PatientDetail patient={selected} onClose={() => setSelected(null)} />}
      {showAdd && <AddPatientModal onClose={() => setShowAdd(false)} onAdd={p => setPatients(ps => [p, ...ps])} />}
    </div>
  );
}

// ─── APPOINTMENTS MODULE ──────────────────────────────────────────────────────
function AppointmentsModule() {
  const [appts, setAppts] = useState(APPOINTMENTS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [view, setView] = useState("list"); // list | calendar
  const [showAdd, setShowAdd] = useState(false);
  const stats = getApptStats(appts);
  const filtered = filterAppointments(appts, search, filter, dateFilter);

  const groupedByDate = filtered.reduce((acc, a) => {
    if (!acc[a.date]) acc[a.date] = [];
    acc[a.date].push(a);
    return acc;
  }, {});

  const cancelAppt = (id) => setAppts(as => as.map(a => a.id === id ? { ...a, status: "Cancelled" } : a));
  const confirmAppt = (id) => setAppts(as => as.map(a => a.id === id ? { ...a, status: "Confirmed" } : a));

  return (
    <div style={{ paddingBottom: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 700, color: "#0f1923", margin: 0 }}>Appointments</h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#8a94a6", marginTop: 6 }}>Schedule and manage patient appointments</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ display: "flex", background: "#f0f0f5", borderRadius: 10, overflow: "hidden" }}>
            {["list", "calendar"].map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding: "9px 16px", border: "none", background: view === v ? "#5b4fcf" : "transparent", color: view === v ? "#fff" : "#666", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13, transition: "all 0.2s", textTransform: "capitalize" }}>{v === "list" ? "☰ List" : "📅 Calendar"}</button>
            ))}
          </div>
          <button onClick={() => setShowAdd(true)} style={{ padding: "11px 22px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #2e9c6e, #43c99a)", color: "#fff", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 14px rgba(46,156,110,0.35)" }}>
            <span style={{ fontSize: 18 }}>+</span> Schedule
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
        <StatCard label="Total" value={stats.total} icon="📋" color="#5b4fcf" />
        <StatCard label="Confirmed" value={stats.confirmed} icon="✅" color="#43a047" />
        <StatCard label="Pending" value={stats.pending} icon="⏳" color="#ffb300" sub="Awaiting" />
        <StatCard label="Cancelled" value={stats.cancelled} icon="❌" color="#e53935" />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔍</span>
          <input placeholder="Search patient or doctor..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", padding: "10px 14px 10px 38px", borderRadius: 10, border: "1.5px solid #e8ecf0", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", background: "#fafbfc", boxSizing: "border-box" }} />
        </div>
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e8ecf0", fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", background: "#fafbfc", color: dateFilter ? "#0f1923" : "#aab0bb" }} />
        {dateFilter && <button onClick={() => setDateFilter("")} style={{ padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e8ecf0", background: "#fff", cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif", color: "#666" }}>Clear Date</button>}
        {["All", "Confirmed", "Pending", "Cancelled"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "9px 16px", borderRadius: 10, border: "1.5px solid " + (filter === f ? "#2e9c6e" : "#e8ecf0"), background: filter === f ? "#2e9c6e" : "#fff", color: filter === f ? "#fff" : "#5a6270", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13, transition: "all 0.2s" }}>
            {f}
          </button>
        ))}
      </div>

      {view === "list" ? (
        /* LIST VIEW */
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {Object.keys(groupedByDate).sort().map(date => (
            <div key={date}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#5b4fcf" }} />
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: 15, fontWeight: 700, color: "#0f1923" }}>
                  {new Date(date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </span>
                <span style={{ fontSize: 12, background: "#f0eeff", color: "#5b4fcf", padding: "2px 8px", borderRadius: 20, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>{groupedByDate[date].length} appt{groupedByDate[date].length > 1 ? "s" : ""}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {groupedByDate[date].map(a => (
                  <div key={a.id} style={{ background: "#fff", borderRadius: 14, border: "1px solid #f0f0f0", padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.03)", transition: "box-shadow 0.2s" }} onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"} onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.03)"}>
                    <div style={{ width: 3, height: 50, borderRadius: 2, background: getTypeColor(a.type), flexShrink: 0 }} />
                    <div style={{ width: 56, textAlign: "center", flexShrink: 0 }}>
                      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "#0f1923" }}>{a.time}</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#aab0bb" }}>{a.duration}min</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: "#0f1923" }}>{a.patient}</div>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#8a94a6", marginTop: 2 }}>{a.doctor} · {a.dept}</div>
                      {a.notes && <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#b0b8c4", marginTop: 3, fontStyle: "italic" }}>"{a.notes}"</div>}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: getTypeColor(a.type), background: getTypeColor(a.type) + "18", padding: "4px 10px", borderRadius: 20, fontFamily: "'DM Sans', sans-serif" }}>{a.type}</span>
                      <Badge status={a.status} />
                      {a.status === "Pending" && (
                        <button onClick={() => confirmAppt(a.id)} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "#e8f5e9", color: "#2e7d32", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Confirm</button>
                      )}
                      {a.status !== "Cancelled" && (
                        <button onClick={() => cancelAppt(a.id)} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: "#ffebee", color: "#b71c1c", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(groupedByDate).length === 0 && (
            <div style={{ background: "#fff", borderRadius: 16, padding: "48px", textAlign: "center", color: "#aab0bb", fontFamily: "'DM Sans', sans-serif" }}>No appointments found</div>
          )}
        </div>
      ) : (
        /* CALENDAR VIEW */
        <CalendarView appts={filtered} />
      )}

      {showAdd && <AddApptModal onClose={() => setShowAdd(false)} onAdd={a => setAppts(as => [a, ...as])} />}
    </div>
  );
}

function CalendarView({ appts }) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const [currentMonth] = useState(new Date(2026, 4, 1));
  const firstDay = currentMonth.getDay();
  const daysInMonth = new Date(2026, 5, 0).getDate();
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => i < firstDay ? null : i - firstDay + 1);

  const getApptForDay = (day) => {
    const dateStr = `2026-05-${String(day).padStart(2, "0")}`;
    return appts.filter(a => a.date === dateStr);
  };

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0f0f0", overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: "#0f1923" }}>May 2026</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid #f5f5f5" }}>
        {days.map(d => <div key={d} style={{ padding: "10px 0", textAlign: "center", fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: "#aab0bb", letterSpacing: "0.05em" }}>{d}</div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
        {cells.map((day, i) => {
          const dayAppts = day ? getApptForDay(day) : [];
          const isToday = day === 7;
          return (
            <div key={i} style={{ minHeight: 80, padding: "8px 6px", borderRight: (i + 1) % 7 !== 0 ? "1px solid #f5f5f5" : "none", borderBottom: "1px solid #f5f5f5", background: isToday ? "#f8f6ff" : "transparent" }}>
              {day && (
                <>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: isToday ? "#5b4fcf" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: isToday ? 700 : 500, color: isToday ? "#fff" : "#5a6270", marginBottom: 4 }}>{day}</div>
                  {dayAppts.slice(0, 2).map(a => (
                    <div key={a.id} style={{ fontSize: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: getTypeColor(a.type), background: getTypeColor(a.type) + "18", padding: "2px 5px", borderRadius: 4, marginBottom: 2, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{a.time} {a.patient.split(" ")[0]}</div>
                  ))}
                  {dayAppts.length > 2 && <div style={{ fontSize: 10, color: "#aab0bb", fontFamily: "'DM Sans', sans-serif" }}>+{dayAppts.length - 2} more</div>}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ active, setActive }) {
  const nav = [
    { id: "patients", label: "Patients", icon: "👥", desc: "Patient records" },
    { id: "appointments", label: "Appointments", icon: "📅", desc: "Scheduling" },
  ];

  return (
    <div style={{ width: 240, background: "#0f1923", height: "100vh", position: "fixed", left: 0, top: 0, display: "flex", flexDirection: "column", zIndex: 100 }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg, #5b4fcf, #7c6ef5)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏥</div>
          <div>
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 16, color: "#fff", letterSpacing: "-0.02em" }}>MediCore</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase" }}>HMS v2.0</div>
          </div>
        </div>
      </div>

      {/* Profile */}
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar initials="AD" size={32} color="#5b4fcf" />
        <div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#fff" }}>Admin</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Super Admin</div>
        </div>
        <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: "#43c99a" }} />
      </div>

      {/* Nav */}
      <nav style={{ padding: "16px 12px", flex: 1 }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 8px", marginBottom: 8 }}>Modules</div>
        {nav.map(item => (
          <button key={item.id} onClick={() => setActive(item.id)} style={{ width: "100%", padding: "11px 12px", borderRadius: 10, border: "none", background: active === item.id ? "rgba(91,79,207,0.2)" : "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, marginBottom: 4, transition: "all 0.2s", textAlign: "left" }}>
            <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{item.icon}</span>
            <div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: active === item.id ? "#a89cf7" : "rgba(255,255,255,0.7)", transition: "color 0.2s" }}>{item.label}</div>
              <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{item.desc}</div>
            </div>
            {active === item.id && <div style={{ marginLeft: "auto", width: 3, height: 20, background: "#7c6ef5", borderRadius: 2 }} />}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center" }}>© 2026 MediCore HMS</div>
      </div>
    </div>
  );
}

// ─── TOPBAR ───────────────────────────────────────────────────────────────────
function Topbar({ module }) {
  const now = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return (
    <div style={{ position: "fixed", top: 0, left: 240, right: 0, height: 64, background: "rgba(255,255,255,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", padding: "0 32px", justifyContent: "space-between", zIndex: 90 }}>
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#8a94a6" }}>
        <span style={{ color: "#5b4fcf", fontWeight: 600 }}>Dashboard</span> {" / "} {module === "patients" ? "Patients" : "Appointments"}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#aab0bb" }}>{now}</span>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "#f8f6ff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18, position: "relative" }}>
          🔔
          <div style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: "#e53935", border: "2px solid #f8f6ff" }} />
        </div>
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [active, setActive] = useState("patients");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:wght@400;500;600;700&family=DM+Mono&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f5f6fa; }
        @keyframes modalIn { from { opacity: 0; transform: translateY(12px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #d0d4dc; border-radius: 10px; }
      `}</style>
      <Sidebar active={active} setActive={setActive} />
      <Topbar module={active} />
      <main style={{ marginLeft: 240, paddingTop: 64 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 32px 0" }}>
          {active === "patients" ? <PatientsModule /> : <AppointmentsModule />}
        </div>
      </main>
    </>
  );
}

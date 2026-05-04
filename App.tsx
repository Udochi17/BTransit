App.jsx
import { useState, useEffect, useMemo } from "react";

// ─── DATA & CONSTANTS ────────────────────────────────────────────────────────
const BUSES = [
  { id: "b1", name: "Eagle Express", operator: "Eagle Transit Co.", capacity: 45, price: 4500, amenities: ["AC", "WiFi", "USB"], rating: 4.8 },
  { id: "b2", name: "Metro Luxe", operator: "Metro Transit Ltd.", capacity: 54, price: 3200, amenities: ["AC", "Recliner"], rating: 4.5 },
  { id: "b3", name: "Royal Cruiser", operator: "Royal Lines", capacity: 36, price: 6000, amenities: ["AC", "WiFi", "Snacks", "USB"], rating: 4.9 },
  { id: "b4", name: "Swift Shuttle", operator: "Swift Travels", capacity: 33, price: 2800, amenities: ["AC"], rating: 4.2 },
  { id: "b5", name: "Premier Coach", operator: "Premier Lines", capacity: 49, price: 5100, amenities: ["AC", "WiFi", "Recliner", "USB"], rating: 4.7 },
];

const ROUTES = [
  { from: "Lagos", to: "Abuja", busIds: ["b1", "b3", "b5"] },
  { from: "Lagos", to: "Ibadan", busIds: ["b2", "b4"] },
  { from: "Lagos", to: "Benin", busIds: ["b2", "b3"] },
  { from: "Abuja", to: "Kaduna", busIds: ["b1", "b4"] },
  { from: "Enugu", to: "Lagos", busIds: ["b1", "b5"] },
  { from: "Kano", to: "Abuja", busIds: ["b3", "b4"] },
  { from: "Port Harcourt", to: "Lagos", busIds: ["b1", "b2", "b5"] },
  { from: "Ibadan", to: "Abuja", busIds: ["b3", "b5"] },
];

const CITIES = [...new Set(ROUTES.flatMap(r => [r.from, r.to]))].sort();

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const formatMoney = (n) => `₦${Number(n).toLocaleString()}`;
const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-NG", { weekday: "short", year: "numeric", month: "short", day: "numeric" }) : "-";
const makeRef = () => "BK-" + Math.random().toString(36).substring(2, 9).toUpperCase();

// ─── REUSABLE UI COMPONENTS ──────────────────────────────────────────────────
const Card = ({ children }) => (
  <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 24, marginBottom: 16 }}>{children}</div>
);

const FieldLabel = ({ children }) => (
  <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6, fontWeight: 500 }}>{children}</div>
);

const PrimaryBtn = ({ onClick, disabled, children, style }) => (
  <button onClick={onClick} disabled={disabled} style={{
    width: "100%", padding: "12px 20px", borderRadius: 8, border: "none",
    background: disabled ? "#1e293b" : "#2563eb", color: disabled ? "#475569" : "#fff",
    fontWeight: 700, fontSize: 15, cursor: disabled ? "not-allowed" : "pointer", ...style
  }}>{children}</button>
);

const SecondaryBtn = ({ onClick, children }) => (
  <button onClick={onClick} style={{
    padding: "12px 20px", borderRadius: 8, border: "1px solid #334155",
    background: "transparent", color: "#94a3b8", fontWeight: 600, fontSize: 15, cursor: "pointer"
  }}>{children}</button>
);

function StepBar({ current }) {
  const steps = ["Type", "Details", "Buses", "Seats", "Summary", "Done"];
  return (
    <div style={{ display: "flex", gap: 8, padding: "16px 24px", borderBottom: "1px solid #1e293b", overflowX: "auto", background: "#0f172a" }}>
      {steps.map((label, i) => (
        <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, opacity: current === i + 1 ? 1 : 0.5 }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: current >= i + 1 ? "#2563eb" : "#334155", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>{i + 1}</div>
          <span style={{ fontSize: 12, whiteSpace: "nowrap" }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(1);
  const [tripType, setTripType] = useState("");
  const [form, setForm] = useState({ from: "", to: "", date: "", email: "" });
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Load Paystack Script safely
  useEffect(() => {
    const existingScript = document.getElementById("paystack-js");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "paystack-js";
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => setIsScriptLoaded(true);
      document.head.appendChild(script);
    } else {
      setIsScriptLoaded(true);
    }
  }, []);

  const availableBuses = useMemo(() => {
    const route = ROUTES.find(r => r.from === form.from && r.to === form.to);
    return route ? BUSES.filter(b => route.busIds.includes(b.id)) : [];
  }, [form.from, form.to]);

  const price = useMemo(() => {
    if (!selectedBus) return 0;
    if (tripType === "hire") return selectedBus.price * selectedBus.capacity * 0.7;
    return selectedBus.price;
  }, [selectedBus, tripType]);

  const handlePay = () => {
    if (!window.PaystackPop) return alert("Payment system not ready");
    const handler = window.PaystackPop.setup({
      key: "pk_test_xxxxxxxxxxxxxxxxxxxxxxxx", // Replace with real key
      email: form.email || "customer@ride.ng",
      amount: price * 100,
      currency: "NGN",
      callback: () => setStep(6),
      onClose: () => alert("Transaction cancelled"),
    });
    handler.openIframe();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#020817", color: "#e2e8f0", fontFamily: "sans-serif" }}>
      <StepBar current={step} />

      <div style={{ maxWidth: 500, margin: "40px auto", padding: "0 20px" }}>

        {step === 1 && (
          <Card>
            <h2 style={{ marginBottom: 20 }}>Choose Trip</h2>
            {["one-way", "round", "hire"].map(t => (
              <button key={t} onClick={() => { setTripType(t); setStep(2); }} style={{
                width: "100%", padding: 16, marginBottom: 10, borderRadius: 8, background: "#1e293b", color: "white", border: "1px solid #334155", cursor: "pointer", textAlign: "left", textTransform: "capitalize"
              }}>
                <strong>{t.replace("-", " ")}</strong>
              </button>
            ))}
          </Card>
        )}

        {step === 2 && (
          <Card>
            <FieldLabel>From</FieldLabel>
            <select value={form.from} onChange={e => setForm({ ...form, from: e.target.value })} style={{ width: "100%", padding: 12, marginBottom: 15, borderRadius: 8, background: "#1e293b", color: "white" }}>
              <option value="">Select Origin</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <FieldLabel>To</FieldLabel>
            <select value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} style={{ width: "100%", padding: 12, marginBottom: 15, borderRadius: 8, background: "#1e293b", color: "white" }}>
              <option value="">Select Destination</option>
              {CITIES.filter(c => c !== form.from).map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <FieldLabel>Date</FieldLabel>
            <input type="date" onChange={e => setForm({ ...form, date: e.target.value })} style={{ width: "100%", padding: 12, marginBottom: 15, borderRadius: 8, background: "#1e293b", color: "white" }} />

            <FieldLabel>Email</FieldLabel>
            <input type="email" placeholder="email@example.com" onChange={e => setForm({ ...form, email: e.target.value })} style={{ width: "100%", padding: 12, marginBottom: 20, borderRadius: 8, background: "#1e293b", color: "white" }} />

            <PrimaryBtn onClick={() => setStep(3)} disabled={!form.from || !form.to || !form.date}>Find Buses</PrimaryBtn>
            <button onClick={() => setStep(1)} style={{ width: "100%", background: "none", border: "none", color: "#64748b", marginTop: 15, cursor: "pointer" }}>Back</button>
          </Card>
        )}

        {/* Step 3 — Available Buses */}
        {step === 3 && (
          <Card>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Available buses</h2>
            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20 }}>
              {form.from} to {form.to} — {formatDate(form.date)}
            </p>

            {availableBuses.length === 0 ? (
              <div style={{ padding: "20px 0", textAlign: "center" }}>
                <p style={{ color: "#94a3b8" }}>No buses found for this route today.</p>
                <SecondaryBtn onClick={() => setStep(2)}>Try another route</SecondaryBtn>
              </div>
            ) : (
              <>
                {availableBuses.map(bus => (
                  <button
                    key={bus.id}
                    onClick={() => setSelectedBus(bus)}
                    style={{
                      width: "100%", textAlign: "left", marginBottom: 12,
                      padding: 16, borderRadius: 10, cursor: "pointer",
                      border: selectedBus?.id === bus.id ? "2px solid #2563eb" : "1px solid #1e293b",
                      background: selectedBus?.id === bus.id ? "rgba(37,99,235,0.1)" : "#1e293b",
                      color: "#e2e8f0",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <strong>{bus.name}</strong>
                      <span style={{ color: "#60a5fa" }}>{formatMoney(bus.price)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{bus.operator}</div>
                  </button>
                ))}

                <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                  <SecondaryBtn onClick={() => setStep(2)}>Back</SecondaryBtn>
                  <PrimaryBtn
                    onClick={() => setStep(tripType === 'hire' ? 5 : 4)}
                    disabled={!selectedBus}
                  >
                    Select Seat
                  </PrimaryBtn>
                </div>
              </>
            )}
          </Card>
        )}


        {step === 4 && (
          <Card>
            <h3>Select Seat</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, margin: "20px 0" }}>
              {[...Array(selectedBus?.capacity || 0)].map((_, i) => (
                <button key={i} onClick={() => setSelectedSeat(i + 1)} style={{
                  padding: 10, borderRadius: 4, border: "none", background: selectedSeat === i + 1 ? "#2563eb" : "#334155", color: "white"
                }}>{i + 1}</button>
              ))}
            </div>
            <PrimaryBtn onClick={() => setStep(5)} disabled={!selectedSeat}>Confirm Seat</PrimaryBtn>
          </Card>
        )}

        {step === 5 && (
          <Card>
            <h3>Booking Summary</h3>
            <p>Route: {form.from} to {form.to}</p>
            <p>Bus: {selectedBus?.name}</p>
            <p>Total: {formatMoney(price)}</p>
            <PrimaryBtn onClick={handlePay} disabled={!isScriptLoaded}>Pay Now</PrimaryBtn>
          </Card>
        )}

        {step === 6 && (
          <Card style={{ textAlign: "center" }}>
            <h2>Ticket Confirmed!</h2>
            <p>Check your email ({form.email}) for details.</p>
            <PrimaryBtn onClick={() => window.location.reload()}>Book Another</PrimaryBtn>
          </Card>
        )}
      </div>
    </div>
  );
}
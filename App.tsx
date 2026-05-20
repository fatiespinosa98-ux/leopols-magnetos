import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";

type Magneto = {
  id?: number;
  brand: string;
  serial_number: string;
  model: string;
  work_detail: string;
  service_date: string;
  status: string;
};

export default function App() {
  const [magnetos, setMagnetos] = useState<Magneto[]>([]);

  const [brand, setBrand] = useState("Bendix");
  const [serialNumber, setSerialNumber] = useState("");
  const [model, setModel] = useState("");
  const [workDetail, setWorkDetail] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [status, setStatus] = useState("Pendiente");

  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMagnetos();
  }, []);

  async function fetchMagnetos() {
    const { data, error } = await supabase
  .from("MAGNETOS")
  .select("*");

console.log("SUPABASE DATA:", data);
console.log("SUPABASE ERROR:", error);

    if (error) {
      console.error(error);
      return;
    }

    setMagnetos(data || []);
  }

  async function handleAddMagneto() {
    if (!serialNumber || !model || !workDetail || !serviceDate) {
      alert("Complete all fields");
      return;
    }

    const newMagneto = {
      brand,
      serial_number: serialNumber.trim().toUpperCase(),
      model,
      work_detail: workDetail,
      service_date: serviceDate,
      status,
    };

    const { error } = await supabase
      .from("MAGNETOS")
      .insert([newMagneto]);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    alert("GUARDADO!");

    setSerialNumber("");
    setModel("");
    setWorkDetail("");
    setServiceDate("");
    setStatus("Pendiente");

    fetchMagnetos();
  }

  const filteredMagnetos = useMemo(() => {
    return magnetos.filter((m) =>
      m.serial_number.toLowerCase().includes(search.toLowerCase())
    );
  }, [magnetos, search]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >
      <h1
        style={{
          fontSize: "70px",
          fontWeight: "900",
          color: "#0f172a",
          marginBottom: "30px",
          textAlign: "center",
        }}
      >
        Leopol&apos;s Magnetos
      </h1>

      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "20px",
          maxWidth: "1100px",
          margin: "0 auto",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "30px",
            fontSize: "28px",
          }}
        >
          Add New Magneto / Service
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "20px",
          }}
        >
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            style={inputStyle}
          >
            <option>Bendix</option>
            <option>Slick</option>
          </select>

          <input
            placeholder="Serial Number"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            style={inputStyle}
          />

          <input
            placeholder="Model / PN"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={inputStyle}
          />

          <input
            placeholder="Work Detail"
            value={workDetail}
            onChange={(e) => setWorkDetail(e.target.value)}
            style={inputStyle}
          />

          <input
            type="date"
            value={serviceDate}
            onChange={(e) => setServiceDate(e.target.value)}
            style={inputStyle}
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={inputStyle}
          >
            <option>Pendiente</option>
            <option>Cobrado</option>
          </select>

          <button
            type="button"
            onClick={handleAddMagneto}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "14px",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              gridColumn: "span 3",
              marginTop: "10px",
            }}
          >
            Save
          </button>
        </div>
      </div>

      <div
        style={{
          maxWidth: "500px",
          margin: "40px auto",
        }}
      >
        <input
          placeholder="Search magneto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            ...inputStyle,
            width: "100%",
          }}
        />
      </div>

      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {filteredMagnetos.map((m) => (
          <div
            key={m.id}
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "16px",
              marginBottom: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          >
            <h2>
              {m.brand} — {m.serial_number}
            </h2>

            <p>
              <strong>Model:</strong> {m.model}
            </p>

            <p>
              <strong>Work:</strong> {m.work_detail}
            </p>

            <p>
              <strong>Date:</strong> {m.service_date}
            </p>

            <p>
              <strong>Status:</strong> {m.status}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  fontSize: "16px",
};
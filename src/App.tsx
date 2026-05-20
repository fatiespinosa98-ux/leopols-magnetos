import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";

type Status = "OK" | "Pendiente";

type MagnetoRow = {
  id: number;
  brand: "Bendix" | "Slick";
  serial_number: string;
  model: string;
  work_detail: string;
  service_date: string;
  status: Status;
};

function App() {
  const [rows, setRows] = useState<MagnetoRow[]>([]);
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "pending">("all");

  const [brand, setBrand] = useState<"Bendix" | "Slick">("Bendix");
  const [serialNumber, setSerialNumber] = useState("");
  const [model, setModel] = useState("");
  const [workDetail, setWorkDetail] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [status, setStatus] = useState<Status>("Pendiente");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editWork, setEditWork] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editStatus, setEditStatus] = useState<Status>("Pendiente");

  const [addingToSerial, setAddingToSerial] = useState<string | null>(null);
  const [newServiceWork, setNewServiceWork] = useState("");
  const [newServiceDate, setNewServiceDate] = useState("");
  const [newServiceStatus, setNewServiceStatus] = useState<Status>("Pendiente");

  useEffect(() => {
    fetchMagnetos();
  }, []);

  async function fetchMagnetos() {
    const { data, error } = await supabase
      .from("MAGNETOS")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setRows((data || []) as MagnetoRow[]);
  }

  const groupedMagnetos = useMemo(() => {
    const groups: Record<string, MagnetoRow[]> = {};

    rows.forEach((row) => {
      const key = row.serial_number;
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
    });

    return Object.values(groups)
      .map((services) => ({
        serial_number: services[0].serial_number,
        brand: services[0].brand,
        model: services[0].model,
        services,
      }))
      .filter((magneto) => {
        const value = search.toLowerCase();

        const matchesSearch =
          magneto.serial_number.toLowerCase().includes(value) ||
          magneto.model.toLowerCase().includes(value) ||
          magneto.brand.toLowerCase().includes(value);

        const hasPending = magneto.services.some(
          (service) => service.status === "Pendiente"
        );

        return matchesSearch && (paymentFilter === "all" || hasPending);
      });
  }, [rows, search, paymentFilter]);

  async function handleAddMagneto() {
    if (!serialNumber || !model || !workDetail || !serviceDate) {
      alert("Complete all fields");
      return;
    }

    const newRow = {
      brand,
      serial_number: serialNumber.trim().toUpperCase(),
      model,
      work_detail: workDetail,
      service_date: serviceDate,
      status,
    };

    const { error } = await supabase.from("MAGNETOS").insert([newRow]);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setSerialNumber("");
    setModel("");
    setWorkDetail("");
    setServiceDate("");
    setStatus("Pendiente");

    fetchMagnetos();
  }

  async function handleAddService(magneto: {
    serial_number: string;
    brand: "Bendix" | "Slick";
    model: string;
  }) {
    if (!newServiceWork || !newServiceDate) {
      alert("Complete all fields");
      return;
    }

    const newRow = {
      brand: magneto.brand,
      serial_number: magneto.serial_number,
      model: magneto.model,
      work_detail: newServiceWork,
      service_date: newServiceDate,
      status: newServiceStatus,
    };

    const { error } = await supabase.from("MAGNETOS").insert([newRow]);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setAddingToSerial(null);
    setNewServiceWork("");
    setNewServiceDate("");
    setNewServiceStatus("Pendiente");

    fetchMagnetos();
  }

  function startEdit(service: MagnetoRow) {
    setEditingId(service.id);
    setEditWork(service.work_detail);
    setEditDate(service.service_date);
    setEditStatus(service.status);
  }

  async function saveEdit(id: number) {
    const { error } = await supabase
      .from("MAGNETOS")
      .update({
        work_detail: editWork,
        service_date: editDate,
        status: editStatus,
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    setEditingId(null);
    fetchMagnetos();
  }

  async function deleteService(id: number) {
    if (!confirm("Delete this service?")) return;

    const { error } = await supabase.from("MAGNETOS").delete().eq("id", id);

    if (error) {
      console.error(error);
      alert(error.message);
      return;
    }

    fetchMagnetos();
  }

  function getStatusColor(status: string) {
    return status === "OK" ? "#22c55e" : "#facc15";
  }

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Leopol&apos;s Magnetos</h1>

      <div style={formCardStyle}>
        <h2 style={{ textAlign: "center", marginBottom: "25px" }}>
          Add New Magneto / Service
        </h2>

        <div style={formGridStyle}>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value as "Bendix" | "Slick")}
            style={inputStyle}
          >
            <option value="Bendix">Bendix</option>
            <option value="Slick">Slick</option>
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
            onChange={(e) => setStatus(e.target.value as Status)}
            style={inputStyle}
          >
            <option value="Pendiente">Pendiente</option>
            <option value="OK">Cobrado</option>
          </select>

          <button
            type="button"
            onClick={handleAddMagneto}
            style={{
              ...primaryButton,
              gridColumn: "span 3",
            }}
          >
            Save
          </button>
        </div>
      </div>

      <input
        placeholder="Search magneto..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          ...inputStyle,
          width: "55%",
          display: "block",
          margin: "0 auto 25px",
          padding: "18px",
        }}
      />

      <div style={filterContainerStyle}>
        <button
          onClick={() => setPaymentFilter("all")}
          style={{
            ...filterButton,
            background: paymentFilter === "all" ? "#2563eb" : "#e5e7eb",
            color: paymentFilter === "all" ? "white" : "black",
          }}
        >
          Ver todos
        </button>

        <button
          onClick={() => setPaymentFilter("pending")}
          style={{
            ...filterButton,
            background: paymentFilter === "pending" ? "#facc15" : "#e5e7eb",
            color: "black",
          }}
        >
          Falta cobrar
        </button>
      </div>

      <p style={{ textAlign: "center", fontSize: "20px", fontWeight: "700" }}>
        Total Magnetos: {groupedMagnetos.length}
      </p>

      <div style={listStyle}>
        {groupedMagnetos.map((magneto) => (
          <div key={magneto.serial_number} style={magnetoCardStyle}>
            <div style={magnetoGridStyle}>
              <div>
                <h2 style={{ color: "#1d4ed8", marginBottom: "8px" }}>
                  {magneto.brand} — {magneto.serial_number}
                </h2>
                <p>
                  <strong>Model:</strong> {magneto.model}
                </p>
              </div>

              <div>
                <h3>Service History</h3>

                <div style={{ display: "grid", gap: "10px" }}>
                  {magneto.services.map((service) => (
                    <div
                      key={service.id}
                      style={{
                        ...serviceCardStyle,
                        borderLeft: `7px solid ${getStatusColor(service.status)}`,
                      }}
                    >
                      {editingId === service.id ? (
                        <div style={{ display: "grid", gap: "10px" }}>
                          <input
                            value={editWork}
                            onChange={(e) => setEditWork(e.target.value)}
                            style={inputStyle}
                          />

                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            style={inputStyle}
                          />

                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as Status)}
                            style={inputStyle}
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="OK">Cobrado</option>
                          </select>

                          <button onClick={() => saveEdit(service.id)} style={primaryButton}>
                            Save Edit
                          </button>
                        </div>
                      ) : (
                        <>
                          <p>
                            <strong>Date:</strong> {service.service_date}
                          </p>
                          <p>
                            <strong>Work:</strong> {service.work_detail}
                          </p>
                          <p>
                            <strong>Cobrado:</strong>{" "}
                            <span
                              style={{
                                color: service.status === "OK" ? "#16a34a" : "#ca8a04",
                                fontWeight: "700",
                              }}
                            >
                              {service.status === "OK" ? "Cobrado" : "Pendiente"}
                            </span>
                          </p>

                          <button onClick={() => startEdit(service)} style={smallButton}>
                            Edit
                          </button>

                          <button
                            onClick={() => deleteService(service.id)}
                            style={{
                              ...smallButton,
                              background: "#ef4444",
                              color: "white",
                              marginLeft: "8px",
                            }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                {addingToSerial === magneto.serial_number ? (
                  <div style={{ display: "grid", gap: "8px" }}>
                    <input
                      placeholder="Work Detail"
                      value={newServiceWork}
                      onChange={(e) => setNewServiceWork(e.target.value)}
                      style={inputStyle}
                    />

                    <input
                      type="date"
                      value={newServiceDate}
                      onChange={(e) => setNewServiceDate(e.target.value)}
                      style={inputStyle}
                    />

                    <select
                      value={newServiceStatus}
                      onChange={(e) => setNewServiceStatus(e.target.value as Status)}
                      style={inputStyle}
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="OK">Cobrado</option>
                    </select>

                    <button onClick={() => handleAddService(magneto)} style={primaryButton}>
                      Save Service
                    </button>

                    <button onClick={() => setAddingToSerial(null)} style={smallButton}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingToSerial(magneto.serial_number)}
                    style={{
                      ...smallButton,
                      border: "1px solid #22c55e",
                      color: "#16a34a",
                      background: "white",
                      width: "100%",
                    }}
                  >
                    + Add Service
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f8fafc",
  padding: "30px",
  fontFamily: "Inter, Arial, sans-serif",
};

const titleStyle: CSSProperties = {
  fontSize: "64px",
  fontWeight: "900",
  textAlign: "center",
  color: "#0f172a",
  marginBottom: "35px",
};

const formCardStyle: CSSProperties = {
  maxWidth: "1100px",
  margin: "0 auto 35px",
  background: "white",
  padding: "30px",
  borderRadius: "20px",
  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
  border: "1px solid #e5e7eb",
};

const formGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: "18px",
};

const inputStyle: CSSProperties = {
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  fontSize: "16px",
};

const primaryButton: CSSProperties = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "14px",
  borderRadius: "10px",
  fontSize: "16px",
  fontWeight: "700",
  cursor: "pointer",
};

const smallButton: CSSProperties = {
  padding: "8px 12px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  background: "white",
  cursor: "pointer",
  fontWeight: "600",
};

const filterButton: CSSProperties = {
  padding: "10px 18px",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer",
  fontWeight: "700",
};

const filterContainerStyle: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  gap: "15px",
  marginBottom: "25px",
};

const listStyle: CSSProperties = {
  maxWidth: "1200px",
  margin: "0 auto",
  display: "grid",
  gap: "20px",
};

const magnetoCardStyle: CSSProperties = {
  background: "white",
  padding: "24px",
  borderRadius: "18px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
};

const magnetoGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "250px 1fr 160px",
  gap: "25px",
};

const serviceCardStyle: CSSProperties = {
  padding: "14px",
  borderRadius: "10px",
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
};

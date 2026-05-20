import { useEffect, useMemo, useState } from "react";
import type { Magneto, Service } from "./types";
import { loadMagnetos, saveMagnetos } from "./utils/storage";

function App() {
  const [magnetos, setMagnetos] = useState<Magneto[]>(() =>
    loadMagnetos()
  );

  const [search, setSearch] = useState("");

  const [paymentFilter, setPaymentFilter] = useState<
    "all" | "pending"
  >("all");

  const [editingServiceId, setEditingServiceId] =
    useState<string | null>(null);

  const [addingServiceTo, setAddingServiceTo] =
    useState<string | null>(null);

  const [brand, setBrand] =
    useState<"Bendix" | "Slick">("Bendix");

  const [serialNumber, setSerialNumber] =
    useState("");

  const [model, setModel] = useState("");

  const [workDetail, setWorkDetail] =
    useState("");

  const [date, setDate] = useState("");

  const [status, setStatus] = useState<
    "OK" | "Pendiente"
  >("Pendiente");

  const [newServiceWork, setNewServiceWork] =
    useState("");

  const [newServiceDate, setNewServiceDate] =
    useState("");

  const [newServiceStatus, setNewServiceStatus] =
    useState<"OK" | "Pendiente">("Pendiente");

  useEffect(() => {
    saveMagnetos(magnetos);
  }, [magnetos]);

  const filteredMagnetos = useMemo(() => {
    return magnetos.filter((m) => {
      const value = search.toLowerCase();

      const matchesSearch =
        m.serialNumber.toLowerCase().includes(value) ||
        m.model.toLowerCase().includes(value) ||
        m.brand.toLowerCase().includes(value);

      const hasPendingService = m.services.some(
        (service) => service.status === "Pendiente"
      );

      const matchesPaymentFilter =
        paymentFilter === "all" || hasPendingService;

      return matchesSearch && matchesPaymentFilter;
    });
  }, [magnetos, search, paymentFilter]);

  function handleAddMagneto() {
    if (
      !serialNumber ||
      !model ||
      !workDetail ||
      !date
    ) {
      alert("Complete all fields");
      return;
    }

    const newService: Service = {
      id: crypto.randomUUID(),
      workDetail,
      date,
      status,
    };

    const existingMagneto =
      magnetos.find(
        (m) =>
          m.serialNumber
            .trim()
            .toLowerCase() ===
          serialNumber
            .trim()
            .toLowerCase()
      );

    if (existingMagneto) {
      setMagnetos((prev) =>
        prev.map((m) =>
          m.id === existingMagneto.id
            ? {
                ...m,
                services: [
                  ...m.services,
                  newService,
                ],
              }
            : m
        )
      );
    } else {
      const newMagneto: Magneto = {
        id: crypto.randomUUID(),
        brand,
        serialNumber,
        model,
        services: [newService],
      };

      setMagnetos((prev) => [
        ...prev,
        newMagneto,
      ]);
    }

    setSerialNumber("");
    setModel("");
    setWorkDetail("");
    setDate("");
    setStatus("Pendiente");
  }

  function deleteMagneto(id: string) {
    const confirmed = confirm(
      "Delete this magneto?"
    );

    if (!confirmed) return;

    setMagnetos((prev) =>
      prev.filter((m) => m.id !== id)
    );
  }

  function updateService(
    magnetoId: string,
    serviceId: string,
    updatedData: Partial<Service>
  ) {
    setMagnetos((prev) =>
      prev.map((m) => {
        if (m.id !== magnetoId) return m;

        return {
          ...m,
          services: m.services.map((s) =>
            s.id === serviceId
              ? { ...s, ...updatedData }
              : s
          ),
        };
      })
    );
  }

  function addServiceToMagneto(
    magnetoId: string
  ) {
    if (
      !newServiceWork ||
      !newServiceDate
    ) {
      alert("Complete all fields");
      return;
    }

    const newService: Service = {
      id: crypto.randomUUID(),
      workDetail: newServiceWork,
      date: newServiceDate,
      status: newServiceStatus,
    };

    setMagnetos((prev) =>
      prev.map((m) =>
        m.id === magnetoId
          ? {
              ...m,
              services: [
                ...m.services,
                newService,
              ],
            }
          : m
      )
    );

    setNewServiceWork("");
    setNewServiceDate("");
    setNewServiceStatus("Pendiente");
    setAddingServiceTo(null);
  }

  function getStatusColor(
    status: string
  ) {
    return status === "OK"
      ? "#22c55e"
      : "#facc15";
  }

  return (
    <div
      style={{
        padding: "30px",
fontFamily: "Inter, Arial, sans-serif",
background: "#f8fafc",
minHeight: "100vh",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <h1
  style={{
    fontSize: "72px",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: "40px",
    color: "#0f172a",
  }}
>
  Leopol's Magnetos
</h1>

      <div
        style={{
          marginBottom: "30px",
          padding: "30px",
          border: "1px solid #e5e7eb",
          borderRadius: "18px",
          background: "white",
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
        }}
      >
        <h2>
          Add New Magneto / Service
        </h2>

        <div
          style={{
            display: "grid",
gridTemplateColumns: "1fr 1fr 1fr",
gap: "15px",
alignItems: "center",
          }}
        >
          <select
            value={brand}
            onChange={(e) =>
              setBrand(
                e.target.value as
                  | "Bendix"
                  | "Slick"
              )
            }
            style={{
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #d1d5db",
              fontSize: "16px",
              width: "100%",
              height: "52px",
            }}
          >
            <option value="Bendix">
              Bendix
            </option>

            <option value="Slick">
              Slick
            </option>
          </select>

          <input
  placeholder="Serial Number"
  value={serialNumber}
  onChange={(e) =>
    setSerialNumber(e.target.value)
  }
  style={{
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    fontSize: "16px",
  }}
/>

          <input
            placeholder="Model / PN"
            value={model}
            onChange={(e) =>
              setModel(e.target.value)
            }
              style={{
                padding: "14px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
                fontSize: "16px",
              }}
            
          />

          <input
            placeholder="Work Detail"
            value={workDetail}
            onChange={(e) =>
              setWorkDetail(
                e.target.value
              )
            }
            style={{
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #d1d5db",
              fontSize: "16px",
            }}
          />

          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
            style={{
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #d1d5db",
              fontSize: "16px",
            }}
          />

          <select
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value as
                  | "OK"
                  | "Pendiente"
              )
            }
            style={{
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #d1d5db",
              fontSize: "16px",
              width: "100%",
              height: "52px",
            }}
          >
            <option value="OK">
              Cobrado
            </option>

            <option value="Pendiente">
              Pendiente
            </option>
          </select>

          <button
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

      <input
        placeholder="Search magneto..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        style={{
          width: "55%",
          padding: "18px",
          marginBottom: "30px",
          marginTop: "30px",
          borderRadius: "14px",
          border: "1px solid #d1d5db",
          fontSize: "18px",
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      />

      <div
        style={{
          marginBottom: "30px",
          marginTop: "10px",
          display: "flex",
          justifyContent: "center",
          gap: "15px",
        }}
      >
        <button
          onClick={() =>
            setPaymentFilter("all")
          }
          style={{
            marginRight: "10px",
            padding: "8px 12px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            background:
              paymentFilter === "all"
                ? "#2563eb"
                : "#e5e7eb",
            color:
              paymentFilter === "all"
                ? "white"
                : "black",
          }}
        >
          Ver todos
        </button>

        <button
          onClick={() =>
            setPaymentFilter(
              "pending"
            )
          }
          style={{
            padding: "8px 12px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            background:
              paymentFilter ===
              "pending"
                ? "#facc15"
                : "#e5e7eb",
            color: "black",
          }}
        >
          Falta cobrar
        </button>
      </div>

      <p>
        <strong>
          Total Magnetos:
        </strong>{" "}
        {filteredMagnetos.length}
      </p>

      <div
        style={{
          display: "grid",
          gap: "20px",
        }}
      >
        {filteredMagnetos.map(
          (magneto) => (
            <div
              key={magneto.id}
              style={{
                border:
                  "1px solid #ccc",
                borderRadius: "10px",
                padding: "20px",
              }}
            >
              <h2>
                {magneto.brand} —{" "}
                {
                  magneto.serialNumber
                }
              </h2>

              <p>
                <strong>
                  Model:
                </strong>{" "}
                {magneto.model}
              </p>

              <h3>
                Service History
              </h3>

              <div
                style={{
                  display: "grid",
                  gap: "10px",
                }}
              >
                {magneto.services.map(
                  (service) => {
                    const isEditing =
                      editingServiceId ===
                      service.id;

                    return (
                      <div
                        key={service.id}
                        style={{
                          padding:
                            "15px",
                          borderRadius:
                            "8px",
                          background:
                            "#f5f5f5",
                          borderLeft: `8px solid ${getStatusColor(
                            service.status
                          )}`,
                        }}
                      >
                        {isEditing ? (
                          <>
                            <input
                              value={
                                service.workDetail
                              }
                              onChange={(
                                e
                              ) =>
                                updateService(
                                  magneto.id,
                                  service.id,
                                  {
                                    workDetail:
                                      e
                                        .target
                                        .value,
                                  }
                                )
                              }
                            
                            style={{
                              padding: "14px",
                              borderRadius: "10px",
                              border: "1px solid #d1d5db",
                              fontSize: "16px",
                            }}
                            />

                            <input
                              type="date"
                              value={
                                service.date
                              }
                              onChange={(
                                e
                              ) =>
                                updateService(
                                  magneto.id,
                                  service.id,
                                  {
                                    date:
                                      e
                                        .target
                                        .value,
                                  }
                                )
                              }
                              style={{
                                padding: "14px",
                                borderRadius: "10px",
                                border: "1px solid #d1d5db",
                                fontSize: "16px",
                              }}
                            />

                            <select
                              value={
                                service.status
                              }
                              onChange={(
                                e
                              ) =>
                                updateService(
                                  magneto.id,
                                  service.id,
                                  {
                                    status:
                                      e
                                        .target
                                        .value as
                                        | "OK"
                                        | "Pendiente",
                                  }
                                )
                              }
                            >
                              <option value="OK">
                                Cobrado
                              </option>

                              <option value="Pendiente">
                                Pendiente
                              </option>
                            </select>

                            <button
                              onClick={() =>
                                setEditingServiceId(
                                  null
                                )
                              }
                            >
                              Save
                            </button>
                          </>
                        ) : (
                          <>
                            <p>
                              <strong>
                                Date:
                              </strong>{" "}
                              {
                                service.date
                              }
                            </p>

                            <p>
                              <strong>
                                Work:
                              </strong>{" "}
                              {
                                service.workDetail
                              }
                            </p>

                            <p>
                              <strong>
                                Cobrado:
                              </strong>{" "}
                              {service.status ===
                              "OK"
                                ? "Cobrado"
                                : "Pendiente"}
                            </p>

                            <button
                              onClick={() =>
                                setEditingServiceId(
                                  service.id
                                )
                              }
                            >
                              Edit
                            </button>
                          </>
                        )}
                      </div>
                    );
                  }
                )}
              </div>

              <div
                style={{
                  marginTop: "15px",
                }}
              >
                {addingServiceTo ===
                magneto.id ? (
                  <div>
                    <input
                      placeholder="Work Detail"
                      value={
                        newServiceWork
                      }
                      onChange={(e) =>
                        setNewServiceWork(
                          e.target.value
                        )
                      }
                      style={{
                        padding: "14px",
                        borderRadius: "10px",
                        border: "1px solid #d1d5db",
                        fontSize: "16px",
                      }}
                    />

                    <input
                      type="date"
                      value={
                        newServiceDate
                      }
                      onChange={(e) =>
                        setNewServiceDate(
                          e.target.value
                        )
                       }
              style={{
                padding: "14px",
                borderRadius: "10px",
                border: "1px solid #d1d5db",
                fontSize: "16px",
              }}
                    />

                    <select
                      value={
                        newServiceStatus
                      }
                      onChange={(e) =>
                        setNewServiceStatus(
                          e.target
                            .value as
                            | "OK"
                            | "Pendiente"
                        )
                      }
                    >
                      <option value="OK">
                        Cobrado
                      </option>

                      <option value="Pendiente">
                        Pendiente
                      </option>
                    </select>

                    <button
                      onClick={() =>
                        addServiceToMagneto(
                          magneto.id
                        )
                      }
                    >
                      Save Service
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() =>
                      setAddingServiceTo(
                        magneto.id
                      )
                    }
                  >
                    + Add Service
                  </button>
                )}
              </div>

              <div
                style={{
                  textAlign: "right",
                  marginTop: "15px",
                }}
              >
                <button
                  onClick={() =>
                    deleteMagneto(
                      magneto.id
                    )
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default App;

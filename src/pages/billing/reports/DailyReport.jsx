  import React, { useEffect, useState } from "react";
  import { useNavigate } from "react-router-dom";
  import * as XLSX from "xlsx";
  import { saveAs } from "file-saver";
  import { getAllCustomerBillings } from "../../../services/customerBilling.service";
  import api from "../../../services/api";

  export const DailyReport = () => {
    const navigate = useNavigate();

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [openRowId, setOpenRowId] = useState(null);
    
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [editId, setEditId] = useState(null);
     const [activeAction, setActiveAction] = useState(null);

const [unlockedRowId, setUnlockedRowId] = useState(null);
const [password, setPassword] = useState("");

    /* ================= FETCH ================= */
    useEffect(() => {
      const fetchBilling = async () => {
        try {
          const data = await getAllCustomerBillings();
          setRows(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Failed to fetch billing data", err);
          setRows([]);
        } finally {
          setLoading(false);
        }
      };
      fetchBilling();
    }, []);

    /* ================= FILTER ================= */
    const filteredRows = rows.filter((r) => {
      const k = search.toLowerCase();

      const matchesSearch =
        !search ||
        r.invoice_number?.toLowerCase().includes(k) ||
        r.customer_name?.toLowerCase().includes(k) ||
        r.phone_number?.includes(k) ||
        r.staff_name?.toLowerCase().includes(k);

      const invoiceTime = new Date(r.created_at).getTime();
      const fromTime = fromDate ? new Date(fromDate + "T00:00:00").getTime() : null;
      const toTime = toDate ? new Date(toDate + "T23:59:59").getTime() : null;

      const matchesDate =
        (!fromTime || invoiceTime >= fromTime) &&
        (!toTime || invoiceTime <= toTime);

      return matchesSearch && matchesDate;
    });

    /* ================= EXCEL EXPORT ================= */
  const exportExcel = () => {
    if (!filteredRows.length) return;

    const maxProducts = Math.max(
      ...filteredRows.map((r) => r.products?.length || 0)
    );

    const data = filteredRows.map((r) => {
      const row = {
        Invoice: r.invoice_number,
        Date: new Date(r.created_at).toLocaleString("en-IN"),
        Customer: r.customer_name,
        Phone: r.phone_number,
        Staff: r.staff_name,
        "Grand Total": r.grand_total,
        Pending: r.balance_due,
      };

      for (let i = 0; i < maxProducts; i++) {
        const p = r.products?.[i];

        // 🔹 SINGLE CELL: product master details
        row[`Product ${i + 1}`] = p
          ? `${p.product_name} | ${p.product_brand} | ${p.product_category} | Default Qty: ${p.product_qunatity ?? "-"}`
          : "";

        // 🔹 SEPARATE COLUMNS
        row[`Product ${i + 1} Buy Qty`] = p ? p.quantity : "";
        row[`Product ${i + 1} Rate`] = p ? p.rate : "";
      }

      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Daily Report");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      "daily_report_correct_format.xlsx"
    );
  };
    const unlockRow = async () => {
  if (!password) {
    alert("Enter admin password");
    return;
  }

  try {
    const res = await api.post("/auth/verify-password", { password });

    if (res.data.success) {
      setUnlockedRowId(activeAction.id); // 🔓 unlock only this row
    } else {
      alert("❌ Wrong password");
    }
  } catch (err) {
    alert("❌ Wrong password");
  }
};


    if (loading) return <p>Loading billing reports...</p>;

    return (
      <div className="row justify-content-center">
        <div className="col-lg-12">

          {/* ===== DATE FILTER ===== */}
          <div className="d-flex align-items-center justify-content-md-end gap-2 mb-3 filter-calender flex-wrap">
            <div className="d-flex align-items-center gap-2">
              <label>
                From <span className="d-none d-md-inline-block">Date</span> :
              </label>
              <input
                type="date"
                className="form-control"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="d-flex align-items-center gap-2">
              <label>
                To <span className="d-none d-md-inline-block">Date</span> :
              </label>
              <input
                type="date"
                className="form-control"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>

          {/* ===== SEARCH + ACTION BUTTONS ===== */}
          <div className="d-md-flex align-items-center justify-content-between">

            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <i className="bi bi-search search-icon"></i>
            </div>

            <div className="d-flex gap-2 flex-wrap justify-content-md-end mt-3 mt-md-0">
              <button className="excel-btn" onClick={exportExcel}>
                <i className="fi fi-tr-file-excel"></i> Export Excel
              </button>

              {/* <button className="pdf-btn">
                <i className="fi fi-tr-file-pdf"></i> Pdf
              </button>

              <button className="print-btn" onClick={() => window.print()}>
                <i className="fi fi-tr-print"></i> Print
              </button> */}
            </div>
          </div>

          {/* ===== TABLE ===== */}
          <div className="common-table-wrapper mt-4">
            <table className="common-table table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Invoice</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Staff</th>
                  <th>Total</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.map((r) => (
                  <React.Fragment key={r.id}>
                    <tr>
                      <td>{r.id}</td>
                      <td>{r.invoice_number}</td>
                      <td>{new Date(r.created_at).toLocaleString("en-IN")}</td>
                      <td>{r.customer_name}</td>
                      <td>{r.phone_number}</td>
                      <td>{r.staff_name}</td>
                      <td>₹ {Number(r.grand_total).toFixed(2)}</td>

                      {/* ===== ACTIONS ===== */}
                      <td className="text-end position-relative">
                        <div className="btn-group align-items-center gap-1">

                          {/* 👁️ VIEW */}
                          <button
                            className="btn btn-sm btn-secondary"
                            title="View"
                            onClick={() =>
                              setOpenRowId(openRowId === r.id ? null : r.id)
                            }
                          >
                          <i className="bi bi-file-earmark-text"></i>
                          </button>

                          {/* 🖨️ REPRINT */}
                        <button
                            className="btn btn-sm btn-dark"
                            title="Reprint"
                            onClick={() => navigate(`/invoice/print/${r.id}`)}
                          >
                            <i className="bi bi-printer"></i>
                          </button>



                          {/* ✏️ EDIT */}
                                <button
                                    className="btn btn-sm btn-warning"
                                    title="Edit"
                                    onClick={() => {
                                      setActiveAction({ id: r.id, type: "edit" });
                                      setUnlockedRowId(null);
                                      setPassword("");
                                    }}
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>


                      {/* 🔑 PASSWORD BOX */}
                                    {activeAction?.id === r.id && unlockedRowId !== r.id && (
                                      <div
                                        className="p-2 border rounded shadow-sm bg-white"
                                        style={{
                                          position: "absolute",
                                          top: "100%",
                                          right: "0",
                                          width: "160px",
                                          textAlign: "center",
                                          zIndex: 1000,
                                        }}
                                      >
                                        <div className="small text-muted mb-1">
                                          Admin Password
                                        </div>

                                        <input
                                          type="password"
                                          className="form-control form-control-sm mb-2"
                                          value={password}
                                          onChange={(e) => setPassword(e.target.value)}
                                          autoComplete="new-password"
                                          spellCheck={false}
                                        />

                                        <button
                                          className="btn btn-sm btn-dark w-100"
                                          onClick={unlockRow}
                                        >
                                          🔓 Unlock
                                        </button>
                                      </div>
                                    )}

                                {/* ✅ CONFIRM BUTTON */}
                          {unlockedRowId === r.id && (
                            <div
                              className="p-2 border rounded bg-light text-center"
                              style={{
                                position: "absolute",
                                top: "100%",
                                right: "0",
                                width: "160px",
                                zIndex: 1000,
                              }}
                            >
                              <button
                                className="btn btn-sm btn-success w-100"
                                onClick={() => {
                                  setActiveAction(null);
                                  setUnlockedRowId(null);
                                  navigate(`/billing/edit/${r.id}`);
                                }}
                              >
                                ✅ Confirm
                              </button>
                            </div>
                          )}

                        </div>
                      </td>
                    </tr>

                    {/* ===== EXPANDED VIEW ===== */}
                  {openRowId === r.id && (
                      <tr>
                        <td colSpan="8">
                          <div className="detail-card">

                            <table className="table table-sm table-bordered mb-0">
                              <thead className="table-light">
                                <tr>
                                  <th className="text-center">#</th>
                                  <th className="text-center">Product</th>
                                  <th className="text-center">Qty</th>
                                  <th className="text-center">Rate</th>
                                  <th className="text-center">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {r.products?.length > 0 ? (
                                  r.products.map((p, i) => (
                                    <tr key={i}>
                                      <td className="text-center">{i + 1}</td>
                                      <td className="text-center">{p.product_name}</td>
                                      <td className="text-center">{p.quantity}</td>
                                      <td className="text-center">₹ {p.rate}</td>
                                      <td className="text-center">₹ {(p.quantity * p.rate).toFixed(2)}</td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan="5" className="text-center">
                                      No products found
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>

                          </div>
                        </td>
                      </tr>
                    )}

                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    );
  };

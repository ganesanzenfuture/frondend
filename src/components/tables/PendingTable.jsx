import React, { useEffect, useState } from "react";
import { getPendingBills } from "../../services/customerBilling.service";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useNavigate } from "react-router-dom";

export const PendingTable = () => {
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  /* ================= LOAD PENDING BILLS ================= */
  useEffect(() => {
    const loadPending = async () => {
      try {
        const data = await getPendingBills();
        setPendingList(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Pending load failed", err);
        setPendingList([]);
      } finally {
        setLoading(false);
      }
    };

    loadPending();
  }, []);

  /* ================= EXCEL EXPORT ================= */
  const exportToExcel = () => {
    if (pendingList.length === 0) return;

    const formattedData = pendingList.map((row) => ({
      "Customer Name": row.customer_name,
      "Mobile Number": row.phone_number,
      Product: row.products || "-",
      Quantity: row.total_quantity || 0,
      "Total Amount": row.grand_total || 0,
      "Paid Amount": row.advance_paid || 0,
      "Pending Amount": row.balance_due || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pending Payments");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(fileData, "Pending_Payments.xlsx");
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <p className="text-center py-3">
        Loading pending payments...
      </p>
    );
  }

  return (
    <div className="common-table-wrapper">

      {/* ===== HEADER ACTIONS ===== */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Pending Payments</h5>

        <div className="d-flex gap-2">
          <button
            className="btn btn-success btn-sm"
            onClick={exportToExcel}
          >
            📊 Export Excel
          </button>
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <table className="common-table table-striped">
        <thead>
          <tr>
            <th>Customer Name</th>
            <th>Mobile Number</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Total Amount</th>
            <th>Paid Amount</th>
            <th>Pending Amount</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {pendingList.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center py-3">
                No pending payments 🎉
              </td>
            </tr>
          ) : (
            pendingList.map((row) => (
              <tr key={row.id}>
                <td>{row.customer_name}</td>
                <td>{row.phone_number}</td>
                <td>{row.products || "-"}</td>
                <td>{row.total_quantity || 0}</td>
                <td>₹{Number(row.grand_total || 0).toFixed(2)}</td>
                <td>₹{Number(row.advance_paid || 0).toFixed(2)}</td>
                <td className="text-danger fw-bold">
                  ₹{Number(row.balance_due || 0).toFixed(2)}
                </td>
                <td>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() =>
                      navigate(`/add-payment/${row.id}`)
                    }
                  >
                    💳 Add Payment
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

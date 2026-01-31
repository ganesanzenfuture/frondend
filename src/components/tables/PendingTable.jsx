import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "../../pages/billing/accounts/add-payment-model.css";

import { getPendingBills } from "../../services/customerBilling.service";
import { getPaymentsByBillingId } from "../../services/customerBillingPayment.service";
import { AddPayment } from "../../pages/billing/accounts/AddPayment";

Modal.setAppElement("#root");

export const PendingTable = () => {
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openRowId, setOpenRowId] = useState(null);
  const [paymentsMap, setPaymentsMap] = useState({});

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBillingId, setSelectedBillingId] = useState(null);

  /* ================= LOAD PENDING ================= */
  const loadPending = async () => {
    setLoading(true);
    const rows = await getPendingBills();
    const normalized = rows.map((r) => ({
      ...r,
      grand_total: Number(r.grand_total),
      advance_paid: Number(r.advance_paid),
      balance_due: Number(r.balance_due),
    }));
    setPendingList(normalized);
    setLoading(false);
  };

  useEffect(() => {
    loadPending();
  }, []);

  /* ================= VIEW PAYMENTS ================= */
  const toggleView = async (billingId) => {
    if (openRowId === billingId) {
      setOpenRowId(null);
      return;
    }

    if (!paymentsMap[billingId]) {
      const res = await getPaymentsByBillingId(billingId);
      setPaymentsMap((prev) => ({
        ...prev,
        [billingId]: res.data || [],
      }));
    }
    setOpenRowId(billingId);
  };

  /* ================= EXCEL EXPORT ================= */
 const exportExcel = async () => {
  if (!pendingList.length) return;

  let excelRows = [];

  for (let i = 0; i < pendingList.length; i++) {
    const row = pendingList[i];

    // 🔹 Load payments if not already loaded
    let payments = paymentsMap[row.id];
    if (!payments) {
      const res = await getPaymentsByBillingId(row.id);
      payments = res.data || [];
    }

    // 🔹 If no payments, still export invoice row
    if (payments.length === 0) {
      excelRows.push({
        "Customer Name": row.customer_name,
        "Mobile Number": row.phone_number,
        "Total Amount": row.grand_total,
        "Paid Amount": row.advance_paid,
        "Pending Amount": row.balance_due,
        "Payment Date & Time": "-",
        "Cash Amount": 0,
        "UPI Amount": 0,
        "Reference No": "-",
        Remarks: "-",
      });
    } else {
      // 🔹 One row per payment
      payments.forEach((p) => {
        excelRows.push({
          "Customer Name": row.customer_name,
          "Mobile Number": row.phone_number,
          "Total Amount": row.grand_total,
          "Paid Amount": row.advance_paid,
          "Pending Amount": row.balance_due,
          "Payment Date & Time": new Date(
            p.created_at
          ).toLocaleString("en-IN"),
          "Cash Amount": Number(p.cash_amount),
          "UPI Amount": Number(p.upi_amount),
          "Reference No": p.reference_no || "-",
          Remarks: p.remarks || "-",
        });
      });
    }
  }

  // 🔹 Create Excel
  const worksheet = XLSX.utils.json_to_sheet(excelRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Pending Payments Full Report"
  );

  const buffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  saveAs(
    new Blob([buffer], { type: "application/octet-stream" }),
    "Pending_Payments_Full_Report.xlsx"
  );
};


  if (loading) {
    return <p className="text-center py-3">Loading pending payments...</p>;
  }

  return (
    <>
      {/* ===== HEADER ===== */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Pending Payments</h5>
        <button className="btn btn-success btn-sm" onClick={exportExcel}>
          <i class="fi fi-tr-file-excel"></i> Export Excel
        </button>
      </div>

      {/* ===== TABLE ===== */}
      <div className="common-table-wrapper">
        <table className="common-table table-striped">
       <thead>
  <tr>
    <th>Customer Name</th>
    <th className="text-center">Mobile</th>
    <th className="text-center">Total</th>
    <th className="text-center">Paid</th>
    <th className="text-center">Pending</th>
    <th className="text-center ms-5">Action</th>
  </tr>
</thead>


          <tbody>
            {pendingList.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-3">
                  No pending payments 🎉
                </td>
              </tr>
            ) : (
              pendingList.map((row) => (
                <React.Fragment key={row.id}>
                 <tr>
                  <td className="">{row.customer_name}</td>
                  <td className="text-center">{row.phone_number}</td>
                  <td className="text-center">₹{row.grand_total.toFixed(2)}</td>
                  <td className="text-center">₹{row.advance_paid.toFixed(2)}</td>
                  <td className="text-center text-danger fw-bold">
                    ₹{row.balance_due.toFixed(2)}
                  </td>
                  <td className="text-end">
                <div className="action-icon-group">
                  <button
                    className="action-icon-btn action-pay"
                    title="Add Payment"
                    onClick={() => {
                      setSelectedBillingId(row.id);
                      setShowPaymentModal(true);
                    }}
                  >
                    <i className="bi bi-credit-card"></i>
                  </button>

                  <button
                    className="action-icon-btn action-view"
                    title="View Payments"
                    onClick={() => toggleView(row.id)}
                  >
                    <i className="bi bi-file-earmark-text"></i>
                  </button>
                </div>
              </td>

                </tr>


                  {/* ===== PAYMENT HISTORY ===== */}
                  {openRowId === row.id && (
                    <tr>
                      <td colSpan="6">
                        <table className="table table-bordered mb-0">
                          <thead>
                            <tr>
                              <th>Date & Time</th>
                              <th>Cash</th>
                              <th>UPI</th>
                              <th>Reference</th>
                              <th>Remarks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {paymentsMap[row.id]?.length ? (
                              paymentsMap[row.id].map((p) => (
                                <tr key={p.id}>
                                  <td>
                                    {new Date(p.created_at).toLocaleString(
                                      "en-IN"
                                    )}
                                  </td>
                                  <td>₹{Number(p.cash_amount).toFixed(2)}</td>
                                  <td>₹{Number(p.upi_amount).toFixed(2)}</td>
                                  <td>{p.reference_no || "-"}</td>
                                  <td>{p.remarks || "-"}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="5" className="text-center">
                                  No payments found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ===== ADD PAYMENT MODAL ===== */}
      <Modal
        isOpen={showPaymentModal}
        onRequestClose={() => setShowPaymentModal(false)}
        overlayClassName="erp-modal-overlay"
        className="erp-modal-container"
      >
        <div className="erp-modal-card">
          <div className="erp-modal-header">
            <h5 className="mb-0">Add Payment</h5>
            <button
              className="btn-close"
              onClick={() => setShowPaymentModal(false)}
            />
          </div>

          <div className="erp-modal-body">
            <AddPayment
              billingId={selectedBillingId}
              onClose={() => setShowPaymentModal(false)}
              onSuccess={() => {
                setShowPaymentModal(false);
                setOpenRowId(null);
                loadPending(); // ✅ refresh table
              }}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

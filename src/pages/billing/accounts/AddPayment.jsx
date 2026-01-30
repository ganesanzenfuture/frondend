import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import { addCustomerPayment } from "../../../services/customerBillingPayment.service";

export const AddPayment = ({ billingId, onClose, onSuccess }) => {
  const id = billingId;

  const [loading, setLoading] = useState(true);
  const [billing, setBilling] = useState(null);

  const [cashAmount, setCashAmount] = useState("");
  const [upiAmount, setUpiAmount] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    const loadBilling = async () => {
      try {
        const res = await api.get(`/customer-billing/${id}`);
        const b = res.data.billing;

        setBilling({
          ...b,
          grand_total: Number(b.grand_total),
          balance_due: Number(b.balance_due),
        });
      } catch (err) {
        alert("Failed to load invoice");
        onClose();
      } finally {
        setLoading(false);
      }
    };

    loadBilling();
  }, [id, onClose]);

  const handleSavePayment = async () => {
    const cash = Number(cashAmount) || 0;
    const upi = Number(upiAmount) || 0;
    const total = cash + upi;

    if (total <= 0) {
      alert("Enter payment amount");
      return;
    }

    if (total > billing.balance_due) {
      alert("Payment exceeds pending amount");
      return;
    }

    try {
      await addCustomerPayment({
        billing_id: id,
        payment_date: new Date().toISOString().split("T")[0],
        cash_amount: cash,
        upi_amount: upi,
        reference_no: upi > 0 ? referenceNo : null,
        remarks,
      });

      alert("Payment added successfully");
      onSuccess?.();
    } catch (err) {
      alert(err.response?.data?.message || "Payment failed");
    }
  };

  if (loading) return <p className="text-center py-3">Loading...</p>;
  if (!billing) return null;

  return (
    <>
      <h5 className="mb-3">Add Payment</h5>

      <div className="row mb-3">
        <div className="col-md-6">
          <p><strong>Invoice:</strong> {billing.invoice_number}</p>
          <p><strong>Customer:</strong> {billing.customer_name}</p>
          <p><strong>Phone:</strong> {billing.phone_number}</p>
        </div>

        <div className="col-md-6 text-end">
          <p>Total: ₹{billing.grand_total.toFixed(2)}</p>
          <p className="text-danger fw-bold">
            Pending: ₹{billing.balance_due.toFixed(2)}
          </p>
        </div>
      </div>

      <hr />

      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Cash Amount</label>
          <input
            type="number"
            className="form-control"
            value={cashAmount}
            onChange={(e) => setCashAmount(e.target.value)}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">UPI Amount</label>
          <input
            type="number"
            className="form-control"
            value={upiAmount}
            onChange={(e) => setUpiAmount(e.target.value)}
          />
        </div>

        {Number(upiAmount) > 0 && (
          <div className="col-12">
            <label className="form-label">UPI Reference No</label>
            <input
              className="form-control"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
            />
          </div>
        )}

        <div className="col-12">
          <label className="form-label">Remarks</label>
          <input
            className="form-control"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 mt-4">
  <button className="btn btn-secondary" onClick={onClose}>
    Cancel
  </button>
  <button className="btn btn-primary" onClick={handleSavePayment}>
    Save Payment
  </button>
</div>

    </>
  );
};

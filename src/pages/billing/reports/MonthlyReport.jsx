import React, { useEffect, useState } from "react";
import { getAllCustomerBillings } from "../../../services/customerBilling.service";
import { toast } from "react-toastify";
import "../../../assets/css/style.css";

export const MonthlyReport = () => {
  // 🔹 TODAY DATE (YYYY-MM-DD)
  const today = new Date().toISOString().split("T")[0];

  const [billings, setBillings] = useState([]);
  const [fromDate, setFromDate] = useState(today); // ✅ DEFAULT TODAY
  const [toDate, setToDate] = useState(today); // ✅ DEFAULT TODAY

  const [summary, setSummary] = useState({
    invoiceCount: 0,
    totalSales: 0,
    totalCGST: 0,
    totalSGST: 0,
    totalGST: 0,
    grandTotal: 0,
    advancePaid: 0,
    advanceCash: 0,
    advanceUPI: 0,
  });

  /* ================= FETCH BILLINGS ================= */
  const fetchBillings = async () => {
    try {
      const data = await getAllCustomerBillings();
      setBillings(data);
    } catch (err) {
      toast.error("Failed to load sales summary");
    }
  };

  useEffect(() => {
    fetchBillings();
  }, []);

  /* ================= CALCULATE SUMMARY ================= */
  useEffect(() => {
    let invoiceCount = 0;
    let totalSales = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalGST = 0;
    let grandTotal = 0;
    let advancePaid = 0;
    let advanceCash = 0;
    let advanceUPI = 0;

    billings.forEach((bill) => {
      const billDate = new Date(bill.created_at);

      if ((!fromDate || billDate >= new Date(fromDate)) && (!toDate || billDate <= new Date(toDate + "T23:59:59"))) {
        invoiceCount++;

        totalSales += Number(bill.subtotal || 0);
        totalCGST += Number(bill.tax_cgst_amount || 0);
        totalSGST += Number(bill.tax_sgst_amount || 0);
        totalGST += Number(bill.tax_gst_amount || 0);
        grandTotal += Number(bill.grand_total || 0);

        advancePaid += Number(bill.advance_paid || 0);
        advanceCash += Number(bill.cash_amount || 0);
        advanceUPI += Number(bill.upi_amount || 0);
      }
    });

    setSummary({
      invoiceCount,
      totalSales,
      totalCGST,
      totalSGST,
      totalGST,
      grandTotal,
      advancePaid,
      advanceCash,
      advanceUPI,
    });
  }, [billings, fromDate, toDate]);

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        {/* DATE FILTER */}
        <div className="modal_form mb-3">
          <div className="form_content ">
            <div className="d-flex justify-content-end gap-2 ">
              <input
                type="date"
                className="form-control"
                style={{ maxWidth: "170px" }}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
              <input type="date" className="form-control" style={{ maxWidth: "170px" }} value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
          </div>
        </div>

        {/* SUMMARY TABLE */}
        <div className="common-table-wrapper ">
          <table className=" common-table table-striped align-middle">
            <thead>
              <tr className="thead">
                <th>Total Invoices</th>
                <th className="text-end fw-bold">{summary.invoiceCount}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>Total Sales Amount</b>
                </td>
                <td className="text-end fw-bold">₹ {summary.totalSales.toFixed(2)}</td>
              </tr>

              <tr>
                <td>
                  <b>Total CGST Amount</b>
                </td>
                <td className="text-end">₹ {summary.totalCGST.toFixed(2)}</td>
              </tr>

              <tr>
                <td>
                  <b>Total SGST Amount</b>
                </td>
                <td className="text-end">₹ {summary.totalSGST.toFixed(2)}</td>
              </tr>

              <tr>
                <td>
                  <b>Total GST Amount</b>
                </td>
                <td className="text-end">₹ {summary.totalGST.toFixed(2)}</td>
              </tr>

              <tr className="table-light">
                <td>
                  <b>Grand Total</b>
                </td>
                <td className="text-end fw-bold text-primary">₹ {summary.grandTotal.toFixed(2)}</td>
              </tr>

              <tr>
                <td>
                  <b>Advance Paid Amount</b>
                </td>
                <td className="text-end text-success">₹ {summary.advancePaid.toFixed(2)}</td>
              </tr>

              <tr>
                <td>
                  <b>Advance Paid – Cash</b>
                </td>
                <td className="text-end">₹ {summary.advanceCash.toFixed(2)}</td>
              </tr>

              <tr>
                <td>
                  <b>Advance Paid – UPI</b>
                </td>
                <td className="text-end">₹ {summary.advanceUPI.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

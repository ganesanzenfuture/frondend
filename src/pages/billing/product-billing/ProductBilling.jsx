import React, { useEffect, useState } from "react";
import "./product-billing.css";
import { Link, useNavigate, useParams } from "react-router-dom";

import { getCustomers, createCustomer } from "../../../services/customer.service";
import { getEmployees, createEmployee } from "../../../services/employee.service";
import { getProducts } from "../../../services/product.service";
import { createCustomerBilling } from "../../../services/customerBilling.service";
import { getAllBankDetails } from "../../../services/bankDetalis.service";

export const ProductBilling = () => {
  const { id } = useParams();   // 👈 this defines id
  const isEdit = Boolean(id);  // 👈 true when editing

  const [paymentMode, setPaymentMode] = useState("cash");
  
  /* ================= MASTER DATA ================= */
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [productsList, setProductsList] = useState([]);

  /* ================= CUSTOMER ================= */
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerAddress, setCustomerAddress] = useState("");

  /* ================= STAFF ================= */
  const [staffName, setStaffName] = useState("");
  const [staffPhone, setStaffPhone] = useState("");
  const [staffSuggestions, setStaffSuggestions] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  /* ================= BILL ================= */
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [billProducts, setBillProducts] = useState([]);
  const [sellQty, setSellQty] = useState("");

  const [advancePaid, setAdvancePaid] = useState(0);
  const [invoicePreview, setInvoicePreview] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [gstPercent, setGstPercent] = useState(18);
  const [cashAmount, setCashAmount] = useState(0);
  const [upiAmount, setUpiAmount] = useState(0);
  const [selectedBankId, setSelectedBankId] = useState(null);
  const navigate = useNavigate();
  const [banks, setBanks] = useState([]);

useEffect(() => {
  if (!id) return; // CREATE mode

  const loadBillingForEdit = async () => {
    try {
      const res = await api.get(`/customer-billing/${id}`);
      const data = res.data;

      // 🟦 CUSTOMER
      setCustomerName(data.customer_name);
      setCustomerPhone(data.phone_number);
      setCustomerAddress(data.address || "");
      setSelectedCustomerId(data.customer_id);

      // 🟦 STAFF
      setStaffName(data.staff_name);
      setStaffPhone(data.staff_phone);

      // 🟦 TAX & PAYMENT
      setGstNumber(data.gst_number || "");
      setGstPercent(data.tax_gst_percent || 0);
      setAdvancePaid(data.advance_paid || 0);
      setCashAmount(data.cash_amount || 0);
      setUpiAmount(data.upi_amount || 0);
      setSelectedBankId(data.bank_id);

      // 🟦 PRODUCTS (MOST IMPORTANT PART)
      const mappedProducts = data.products.map((p) => ({
        product_id: p.product_id,
        product_name: p.product_name,
        brand: p.product_brand,
        category: p.product_category,
        pack_qty: p.pack_qty || "",     // if exists
        sell_qty: p.quantity,            // 👈 customer qty
        rate: p.rate,
        stock: 9999,                     // optional (skip stock check in edit)
      }));

      setBillProducts(mappedProducts);

    } catch (err) {
      console.error("Failed to load billing for edit", err);
      alert("Failed to load billing data");
    }
  };

  loadBillingForEdit();
}, [id]);
  /* ================= LOAD DATA ================= */
useEffect(() => {
  const loadData = async () => {
    try {
      const custRes = await getCustomers();
      const empRes = await getEmployees();
      setEmployees(Array.isArray(empRes) ? empRes : []);
      const prodRes = await getProducts();

      // 🔥 NORMALIZE customer name
      const normalizedCustomers = Array.isArray(custRes)
        ? custRes.map(c => ({
            ...c,
            name: `${c.first_name || ""} ${c.last_name || ""}`.trim()
          }))
        : [];

      setCustomers(normalizedCustomers);
      const normalizedEmployees = Array.isArray(empRes)
        ? empRes.map(e => ({
            ...e,
            name: e.employee_name || ""
          }))
        : [];

      setEmployees(normalizedEmployees);

      const normalizedProducts = Array.isArray(prodRes)
          ? prodRes.map(p => ({
              ...p,
              brand: p.brand_name,
              category: p.category_name,
              quantity: p.quantity_name,
              rate: p.price,          // 🔥 map price → rate
            }))
          : [];

        setProductsList(normalizedProducts);

    } catch (err) {
      console.error(err);
    }
  };

  loadData();
}, []);
useEffect(() => {
  if (isEdit) return; // ❌ don’t change invoice on edit

  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9000) + 1000;
  setInvoicePreview(`INV-${year}-${random}`);
}, [isEdit]);


useEffect(() => {
  const loadBanks = async () => {
    try {
      const res = await getAllBankDetails();
      setBanks(res.data || []);
    } catch (err) {
      console.error("Failed to load banks", err);
    }
  };

  loadBanks();
}, []);


const subtotal = billProducts.reduce(
  (sum, p) => sum + p.sell_qty * p.rate,
  0
);

const halfGstPercent = gstPercent / 2;

const cgstAmount = (subtotal * halfGstPercent) / 100;
const sgstAmount = (subtotal * halfGstPercent) / 100;

const totalTax = cgstAmount + sgstAmount;
const grandTotal = subtotal + totalTax;

const today = new Date().toLocaleDateString("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});




const balanceDue = Math.max(
  grandTotal - advancePaid,
  0
);

  /* ================= ADD PRODUCT ================= */
 const handleAddToBill = () => {
  if (!selectedProduct || !sellQty) return;

  const qty = Number(sellQty);

  if (qty <= 0) {
    alert("Enter valid quantity");
    return;
  }

  if (qty > selectedProduct.stock) {
    alert("Not enough stock");
    return;
  }

  setBillProducts((prev) => {
    const existingIndex = prev.findIndex(
      (p) => p.product_id === selectedProduct.id
    );

    // 🔁 IF PRODUCT ALREADY EXISTS → MERGE
    if (existingIndex !== -1) {
      return prev.map((item, index) =>
        index === existingIndex
          ? {
              ...item,
              sell_qty: item.sell_qty + qty,      // increase customer qty
              stock: item.stock - qty,             // reduce stock
            }
          : item
      );
    }

    // ➕ NEW PRODUCT ROW
    return [
      ...prev,
      {
        product_id: selectedProduct.id,
        product_name: selectedProduct.product_name,
        brand: selectedProduct.brand,
        category: selectedProduct.category,
        pack_qty: selectedProduct.quantity, // product qty
        sell_qty: qty,                      // customer qty
        stock: selectedProduct.stock - qty,
        rate: selectedProduct.price,
      },
    ];
  });

  // 🔻 reduce stock in product list
  setProductsList((prev) =>
    prev.map((p) =>
      p.id === selectedProduct.id
        ? { ...p, stock: p.stock - qty }
        : p
    )
  );

  setSellQty("");
  setSelectedProduct(null);
};



  /* ================= REMOVE PRODUCT ================= */
  const removeProduct = (index) => {
    setBillProducts((prev) => prev.filter((_, i) => i !== index));
  };

  /* ================= ENSURE CUSTOMER ================= */
 const ensureCustomerExists = async () => {
  if (selectedCustomerId) return selectedCustomerId;

  const existing = customers.find((c) => c.phone === customerPhone);
  if (existing) return existing.id;

  // 🔥 SPLIT FULL NAME → first_name & last_name
  const [first_name, ...rest] = customerName.trim().split(" ");
  const last_name = rest.join(" ");

  const newCustomer = await createCustomer({
    first_name,
    last_name,
    phone: customerPhone,
  });

  // backend returns { message, customer }
  setCustomers((prev) => [...prev, newCustomer.customer]);

  return newCustomer.customer.id;
};

  /* ================= ENSURE STAFF ================= */
 const ensureEmployeeExists = async () => {
  if (selectedEmployeeId) return selectedEmployeeId;

  const existing = employees.find((e) => e.phone === staffPhone);
  if (existing) return existing.id;

  const newEmployeeRes = await createEmployee({
    employee_name: staffName,
    phone: staffPhone,
  });

  // backend returns { message, employee }
  const employee = newEmployeeRes.data.employee;

  setEmployees((prev) => [
    ...prev,
    { ...employee, name: employee.employee_name },
  ]);

  return employee.id;
};


  /* ================= SAVE ================= */
 const handleSaveBilling = async () => {
  if (!customerName || !customerPhone) {
  alert("Customer name and phone are required");
  return;
}

if (!/^\d{10}$/.test(customerPhone)) {
  alert("Enter valid 10-digit customer phone number");
  return;
}

  try {
    const customer_id = await ensureCustomerExists();
    await ensureEmployeeExists();

    if (!billProducts.length) {
      alert("Add at least one product");
      return;
    }

    if (cashAmount + upiAmount !== advancePaid) {
      alert("Cash + UPI must equal Advance Paid");
      return;
    }

    if (!/^\d{10}$/.test(staffPhone)) {
      alert("Invalid staff phone");
      return;
    }
    if (!selectedBankId) {
  alert("Please select bank details");
  return;
}

    const payload = {
      customer_id,
      customer_name: customerName,
      phone_number: customerPhone,
      gst_number: gstNumber || null,

      staff_name: staffName,
      staff_phone: staffPhone,

      bank_id: selectedBankId, // 🔥 REQUIRED (temporary)

      tax_gst_percent: gstPercent,
      advance_paid: advancePaid,
      cash_amount: cashAmount,
      upi_amount: upiAmount,

      products: billProducts.map((p) => ({
        product_id: p.product_id,
        quantity: p.sell_qty,
        rate: p.rate,
      })),
    };

    console.log("FINAL BILLING PAYLOAD:", payload);

        if (isEdit) {
        await api.put(`/customer-billing/${id}`, payload);
        navigate(`/invoice/print/${id}`);
      } else {
        const res = await createCustomerBilling(payload);
        navigate(`/invoice/print/${res.billing_id}`);
      }

    navigate(`/invoice/print/${res.billing_id}`);
  } catch (err) {
    alert(err.response?.data?.message || "Invoice save failed");
  }
};



  return (
    <div className="product-billing">
      <div className="row gy-4">

        {/* ================= LEFT ================= */}
        <div className="col-md-7">
          <div className="product-list-items">
            <div className="row gy-4">
             {/* ================= STAFF (SMALL – TOP LEFT) ================= */}
<div className="col-lg-12">
  <div className="staff-small-box">
    <div className="row g-2">

      {/* STAFF NAME */}
      <div className="col-md-6 position-relative">
        <label className="staff-label">Staff Name</label>
        <input
          className="form-control form-control-sm staff-input"
          value={staffName}
          onChange={(e) => {
            const v = e.target.value;
            setStaffName(v);
            setSelectedEmployeeId(null);

            if (!v) {
              setStaffSuggestions([]);
              return;
            }

            setStaffSuggestions(
              employees.filter(
                (s) =>
                  (s.name || "").toLowerCase().includes(v.toLowerCase()) ||
                  (s.phone || "").includes(v)
              )
            );
          }}
        />

        {staffSuggestions.length > 0 && (
          <ul className="list-group position-absolute w-100 z-3 small">
            {staffSuggestions.map((s) => (
              <li
                key={s.id}
                className="list-group-item list-group-item-action py-1"
                onClick={() => {
                  setStaffName(s.name || "");
                  setStaffPhone(s.phone || "");
                  setSelectedEmployeeId(s.id);
                  setStaffSuggestions([]);
                }}
              >
                {s.name} – {s.phone}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* STAFF PHONE */}
      <div className="col-md-6">
        <label className="staff-label">Staff Phone</label>
        <input
          className="form-control form-control-sm staff-input"
          value={staffPhone}
          onChange={(e) => setStaffPhone(e.target.value)}
        />
      </div>

    </div>
  </div>
</div>


              {/* CUSTOMER DETAILS */}
              <div className="col-lg-12">
                <div className="product-list-box">
                  <h5 className="box-title">
                    <i className="fi fi-tr-user-pen"></i> Customer Details
                  </h5>

                      <div className="row gy-4">
                        {/* CUSTOMER NAME */}
                        <div className="col-md-6 position-relative">
                          <label className="form-label">Customer Name</label>
                          <input
                            className="form-control"
                            value={customerName}
                            onChange={(e) => {
                              const v = e.target.value;
                              setCustomerName(v);
                              setSelectedCustomerId(null);

                              if (!v) {
                                setCustomerSuggestions([]);
                                return;
                              }

                              setCustomerSuggestions(
                                customers.filter(
                                  (c) =>
                                    (c.name || "").toLowerCase().includes(v.toLowerCase()) ||
                                    (c.phone || "").includes(v)
                                )
                              );
                            }}
                             onBlur={() => setTimeout(() => setCustomerSuggestions([]), 150)}
                          />

                          {customerSuggestions.length > 0 && (
                            <ul className="list-group position-absolute w-100 z-3">
                              {customerSuggestions.map((c) => (
                                <li
                                  key={c.id}
                                  className="list-group-item list-group-item-action"
                                  onClick={() => {
                                    setCustomerName(c.name || "");
                                    setCustomerPhone(c.phone || "");
                                    setCustomerAddress(c.address || ""); 
                                    setSelectedCustomerId(c.id);
                                    setCustomerSuggestions([]);
                                  }}
                                >
                                 {c.name || "No Name"} – {c.phone}
                                </li>
                              ))} 
                            </ul>
                          )}
                        </div>
                     

                    {/* CUSTOMER PHONE */}
                      <div className="col-md-6">
                        <label className="form-label">Customer Phone</label>
                        <input
                          className="form-control"
                          value={customerPhone}
                          onChange={(e) => {
                            const v = e.target.value;
                            setCustomerPhone(v);
                            setSelectedCustomerId(null);

                            if (!v) {
                              setCustomerSuggestions([]);
                              return;
                            }

                            setCustomerSuggestions(
                              customers.filter(
                                (c) =>
                                  (c.phone || "").includes(v) ||
                                  (c.name || "").toLowerCase().includes(customerName.toLowerCase())
                              )
                            );
                          }}
                           onBlur={() => setTimeout(() => setCustomerSuggestions([]), 150)}
                        />
                      </div>
                            </div>
                </div>
              </div>

              {/* ADD PRODUCT */}
              <div className="col-lg-12">
                <div className="product-list-box">
                  <h5 className="box-title">
                    <i className="fi fi-tr-shopping-cart-add"></i> Add Products
                  </h5>

                  <div className="row gy-4">
                    <div className="col-md-6">
                     <select
                          className="form-select"
                          onChange={(e) =>
                            setSelectedProduct(
                              productsList.find((p) => p.id == e.target.value)
                            )
                          }
                        >
                          <option value="">Select Product</option>
                          {productsList.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.product_name} ({p.brand} - {p.category})
                            </option>

                          ))}
                        </select>

                    </div>

                    <div className="col-md-6">
                     <select className="form-select" disabled>
                        <option>
                          {selectedProduct ? `${selectedProduct.quantity} Kg` : "Qty"}
                        </option>
                      </select>

                    </div>

                    <div className="col-md-6">
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Enter customer quantity"
                          value={sellQty}
                          onChange={(e) => setSellQty(e.target.value)}
                        />

                    </div>

                    <div className="col-md-6">
                      <button className="main-btn" onClick={handleAddToBill}>
                        <i className="bi bi-plus"></i> Add to Bill
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* PRODUCT TABLE */}
              <div className="col-lg-12">
                <div className="common-table-wrapper">
                  <table className="common-table table-striped">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Brand</th>
                        <th>Qty</th>
                        <th>Customer Qty</th>
                        <th>Stock</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billProducts.length ? (
                        billProducts.map((p, i) => (
                          <tr key={i}>
                            <td>{p.product_name}</td>
                            <td>
                                {p.brand} - {p.category}
                              </td>

                              <td>
                                {p.pack_qty} Kg
                              </td>
                              <td>{p.sell_qty}</td>

                                <td>{p.stock}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => removeProduct(i)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center">
                            No products added
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="col-md-5">
  <div className="product-list-box invoice-box">
    {/* Header */}
    <div className="row invoice-header">
      <div className="col-6">
        <div className="title">INVOICE</div>
        <div className="invoice-no">{invoicePreview}</div>
      </div>

      <div className="col-6 right">
        <div className="date">Date</div>
        <div className="due">{today}</div>

        <input
          className="form-control mt-2"
          placeholder="GST Number"
          value={gstNumber}
          onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
        />
      </div>
         {/* ================= BANK SELECT ================= */}
                <div className="mt-3">
                  <label className="form-label">Select Bank</label>
                  <select
                    className="form-select"
                    value={selectedBankId || ""}
                    onChange={(e) => setSelectedBankId(Number(e.target.value))}
                  >
                    <option value="">Select Bank</option>

                    {banks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.bank_name} – {b.account_number}
                      </option>
                    ))}
                  </select>
                </div>

    </div>

    {/* Bill Info */}
    <div className="row bill-info">
      <div className="col-6">
        <div className="label">Bill From</div>
        <div className="name">BillMaster Pro Solutions</div>
        <div className="text">123 Tech Park, Suite 404</div>
        <div className="text">San Francisco, CA 94107</div>
      </div>

      <div className="col-6 right">
        <div className="label">Bill To</div>
        <div className="name">{customerName || "-"}</div>
        <div className="text">{customerAddress || "-"}</div>
      </div>

    </div>
        

    {/* Product Details */}
    <div className="products">
  <div className="label">Product Details</div>

  <div className="row product-head">
    <div className="col-5">Product</div>
    <div className="col-2 center">Qty</div>
    <div className="col-2 right">Rate</div>
    <div className="col-3 right">Total</div>
  </div>

  {billProducts.length === 0 ? (
    <div className="text-center py-2">No products added</div>
  ) : (
    billProducts.map((p, i) => (
      <div className="row product-row" key={i}>
        <div className="col-5">
          {p.product_name} ({p.pack_qty} Kg)
        </div>

        <div className="col-2 center">
          {p.sell_qty}
        </div>

        <div className="col-2 right">
          {p.rate}
        </div>

        <div className="col-3 right">
          {(p.sell_qty * p.rate).toFixed(2)}
        </div>
      </div>
    ))
  )}
</div>


    {/* Amounts */}
    <div className="amounts">
      <div className="row">
        <div className="col-6">
          <p className="amount-text">Subtotal</p>
        </div>
        <div className="col-6 right">
          <p className="amount-text">₹{subtotal.toFixed(2)}</p>

        </div>
      </div>
{/* GST SELECTION */}
<div className="row align-items-center">
  <div className="col-6 d-flex align-items-center gap-2">
    <p className="amount-text mb-0">Tax (GST)</p>

    <select
      className="form-select form-select-sm"
      style={{ width: "70px" }}
      value={gstPercent}
      onChange={(e) => setGstPercent(Number(e.target.value))}
    >
      <option value={0}>0%</option>
      <option value={5}>5%</option>
      <option value={12}>12%</option>
      <option value={18}>18%</option>
      <option value={28}>28%</option>
    </select>
  </div>

  <div className="col-6 text-end">
    <p className="amount-text mb-0">
      ₹{totalTax.toFixed(2)}
    </p>
  </div>
</div>

{/* CGST */}
<div className="row align-items-center">
  <div className="col-6">
    <p className="amount-text mb-0">
      CGST ({halfGstPercent}%)
    </p>
  </div>
  <div className="col-6 text-end">
    <p className="amount-text mb-0">
      ₹{cgstAmount.toFixed(2)}
    </p>
  </div>
</div>

{/* SGST */}
<div className="row align-items-center">
  <div className="col-6">
    <p className="amount-text mb-0">
      SGST ({halfGstPercent}%)
    </p>
  </div>
  <div className="col-6 text-end">
    <p className="amount-text mb-0">
      ₹{sgstAmount.toFixed(2)}
    </p>
  </div>
</div>






      <div className="row grand">
        <div className="col-6">
          <p className="amount-text">Grand Total</p>
        </div>
        <div className="col-6 right">
          <p className="amount-text">₹{grandTotal.toFixed(2)}</p>

        </div>
      </div>
    </div>

    {/* Payment Values */}
 <div className="row payment-values">
  <div className="col-6">
    <div className="label">Advance Paid</div>
    <input
      type="number"
      className="form-control"
      value={advancePaid}
      onChange={(e) => {
        const val = Number(e.target.value) || 0;
        setAdvancePaid(val);
        setCashAmount(0);
        setUpiAmount(0);
      }}
    />
  </div>

  <div className="col-6">
    <div className="label">Balance Due</div>
    <input
      className="form-control danger"
      value={`₹${balanceDue.toFixed(2)}`}
      readOnly
    />
  </div>
</div>



   {/* Payment Mode */}
<div className="payment-mode">
  <div className="label mb-2">Payment Mode</div>

  <div className="row g-3">
    {/* CASH */}
    <div className="col-4">
      <div
        className={`radio-card ${paymentMode === "cash" ? "active" : ""}`}
        onClick={() => setPaymentMode("cash")}
      >
        <div className="icon">
          <i className="bi bi-cash-coin"></i>
        </div>
        <span>CASH</span>
      </div>

      {/* 👇 CASH INPUT UNDER CASH CARD */}
      {paymentMode === "cash" && advancePaid > 0 && (
        <input
          type="number"
          className="form-control mt-2"
          placeholder="Cash amount"
          value={cashAmount}
          onChange={(e) => {
            const val = Number(e.target.value) || 0;
            if (val <= advancePaid) {
              setCashAmount(val);
              setUpiAmount(advancePaid - val);
            }
          }}
        />
      )}
    </div>

    {/* UPI */}
    <div className="col-4">
      <div
        className={`radio-card ${paymentMode === "upi" ? "active" : ""}`}
        onClick={() => setPaymentMode("upi")}
      >
        <div className="icon">
          <i className="bi bi-qr-code-scan"></i>
        </div>
        <span>UPI / QR</span>
      </div>

      {/* 👇 UPI INPUT UNDER UPI CARD */}
      {paymentMode === "upi" && advancePaid > 0 && (
        <input
          type="number"
          className="form-control mt-2"
          placeholder="UPI amount"
          value={upiAmount}
          onChange={(e) => {
            const val = Number(e.target.value) || 0;
            if (val <= advancePaid) {
              setUpiAmount(val);
              setCashAmount(advancePaid - val);
            }
          }}
        />
      )}
    </div>

    {/* CARD */}
    <div className="col-4">
      <div
        className={`radio-card ${paymentMode === "card" ? "active" : ""}`}
        onClick={() => setPaymentMode("card")}
      >
        <div className="icon">
          <i className="bi bi-credit-card-fill"></i>
        </div>
        <span>CARD</span>
      </div>
    </div>
  </div>
</div>



    {/* Action */}
    <button className="main-btn w-100 text-center d-block" onClick={handleSaveBilling}>
      <i className="fi fi-tr-print me-2"></i>Save & Print
    </button>

    <div className="invoice-footer">
      <Link><i className="bi bi-save me-2"></i>Save Draft</Link>
      <Link><i className="bi bi-x-circle-fill me-2"></i>Discard</Link>
    </div>
  </div>
</div>


      </div>
    </div>
  );
};

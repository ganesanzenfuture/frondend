import React, { useEffect, useState } from "react";
import "./product-billing.css";
import { useNavigate, useParams } from "react-router-dom";

import { getCustomers, createCustomer } from "../../../services/customer.service";
import { getEmployees, createEmployee } from "../../../services/employee.service";
import { getProducts } from "../../../services/product.service";
import { createCustomerBilling } from "../../../services/customerBilling.service";
import { getAllBankDetails } from "../../../services/bankDetalis.service";
import { getCompanyDetails } from "../../../services/companyDetails.service";

import api from "../../../services/api";
import { toast } from "react-toastify";

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
  const [company, setCompany] = useState(null);

useEffect(() => {
  if (!id) return;

  const loadBillingForEdit = async () => {
    try {
      const res = await api.get(`/customer-billing/${id}`);
      const data = res.data;

      // 🟦 CUSTOMER
      setCustomerName(data.customer_name || "");
      setCustomerPhone(data.phone_number || "");
      setCustomerAddress(data.address || "");
      setSelectedCustomerId(data.customer_id || null);

      // 🟦 STAFF
      setStaffName(data.staff_name || "");
      setStaffPhone(data.staff_phone || "");
      setSelectedEmployeeId(data.staff_id || null);

      // 🟦 BANK & PAYMENT
      setSelectedBankId(Number(data.bank_id) || null);
      setAdvancePaid(Number(data.advance_paid) || 0);
      setCashAmount(Number(data.cash_amount) || 0);
      setUpiAmount(Number(data.upi_amount) || 0);

      // 🔁 auto payment mode
      if (data.upi_amount > 0) setPaymentMode("upi");
      else setPaymentMode("cash");

      // 🟦 GST
      setGstNumber(data.gst_number || "");
      setGstPercent(Number(data.tax_gst_percent) || 0);

      // 🟦 INVOICE NO (IMPORTANT)
      setInvoicePreview(data.invoice_number);

      // 🟦 PRODUCTS
      const mappedProducts = data.products.map(p => ({
        product_id: p.product_id,
        product_name: p.product_name,
        brand: p.product_brand,
        category: p.product_category,
        product_quantity: p.product_quantity,
        sell_qty: Number(p.quantity),
        rate: Number(p.rate),
        stock: "-", // ❌ don’t touch stock on edit
      }));

      setBillProducts(mappedProducts);

    } catch (err) {
      console.error("Failed to load billing for edit", err);
      toast.error("Failed to load billing data");
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
               stock: Number(p.stock || 0),
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
  if (!selectedProduct) {
    toast.warn("Please select a product");
    return;
  }

  if (!sellQty) {
    toast.error("Enter customer quantity");
    return;
  }

  const qty = Number(sellQty); // ✅ DEFINE FIRST

  if (isNaN(qty) || qty <= 0) {
    toast.error("Enter a valid customer quantity");
    return;
  }

  if (!isEdit && qty > selectedProduct.stock) {
    toast.error("Not enough stock available");
    return;
  }

  setBillProducts((prev) => {
    const existingIndex = prev.findIndex(
      (p) => p.product_id === selectedProduct.id
    );

    // 🔁 merge if already exists
    if (existingIndex !== -1) {
      return prev.map((item, index) =>
        index === existingIndex
          ? {
              ...item,
              sell_qty: item.sell_qty + qty,
              stock: item.stock - qty,
            }
          : item
      );
    }

    // ➕ new row
    return [
      ...prev,
      {
        product_id: selectedProduct.id,
        product_name: selectedProduct.product_name,
        brand: selectedProduct.brand,
        category: selectedProduct.category,

        product_quantity: selectedProduct.quantity,
        sell_qty: qty,

        stock: selectedProduct.stock - qty,
        rate: selectedProduct.rate,
      },
    ];
  });

  // 🔻 reduce stock from master list
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
  const removed = billProducts[index];

  setProductsList((prev) =>
    prev.map((p) =>
      p.id === removed.product_id
        ? { ...p, stock: p.stock + removed.sell_qty }
        : p
    )
  );

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
  if (!customerName.trim()) {
    toast.error("Customer name is required");
    return;
  }

  if (!/^\d{10}$/.test(customerPhone)) {
    toast.error("Enter a valid 10-digit customer phone number");
    return;
  }

  if (!billProducts.length) {
    toast.warn("Add at least one product to the bill");
    return;
  }

  if (cashAmount + upiAmount !== advancePaid) {
    toast.error("Cash + UPI amount must equal Advance Paid");
    return;
  }

  if (!/^\d{10}$/.test(staffPhone)) {
    toast.error("Enter a valid 10-digit staff phone number");
    return;
  }

  if (!selectedBankId) {
    toast.warn("Please select bank details");
    return;
  }
  if (advancePaid > grandTotal) {
  toast.error("Advance paid cannot exceed Grand Total");
  return;
}

if (cashAmount + upiAmount !== advancePaid) {
  toast.error("Cash + UPI must exactly match Advance Paid");
  return;
}


  try {
    const customer_id = await ensureCustomerExists();
    await ensureEmployeeExists();

    const payload = {
      customer_id,
      customer_name: customerName,
      phone_number: customerPhone,
      gst_number: gstNumber || null,

      staff_name: staffName,
      staff_phone: staffPhone,

      bank_id: selectedBankId,

      tax_gst_percent: gstPercent,
      advance_paid: Number(advancePaid),
      cash_amount: Number(cashAmount),
      upi_amount: Number(upiAmount),

      products: billProducts.map((p) => ({
        product_id: p.product_id,
        quantity: Number(p.sell_qty),
        product_quantity: p.product_quantity,
        rate: Number(p.rate),
      })),
    };

    let billingId = id;

    if (isEdit) {
      await api.put(`/customer-billing/${id}`, payload);
    } else {
      const res = await createCustomerBilling(payload);
      billingId = res.billing_id;
    }

    toast.success("Invoice saved successfully");

    // 👉 OPEN PRINT PAGE
    navigate(`/invoice/print/${billingId}`);

    // 👉 AFTER PRINT → RESET BILLING PAGE
    setTimeout(() => {
      navigate("/product-billing", { replace: true });
    }, 600);

  } catch (err) {
    toast.error(err.response?.data?.message || "Invoice save failed");
  }
};
const resetBillingPage = () => {
  // customer
  setCustomerName("");
  setCustomerPhone("");
  setGstNumber("");

  // staff
  setStaffName("");
  setStaffPhone("");

  // payment
  setAdvancePaid(0);
  setCashAmount(0);
  setUpiAmount(0);
  setSelectedBankId(null);

  // products
  setBillProducts([]);

  setGstPercent(
  data.tax_gst_percent !== null
    ? Number(data.tax_gst_percent)
    : 0
);

  // navigate to clean page (this resets edit mode automatically)
  navigate("/product-billing", { replace: true });
};


const getCurrentTime = () => {
  const now = new Date();
  return now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const handleSaveDraft = async () => {
  if (!billProducts.length) {
    toast.warn("Add at least one product before saving draft");
    return;
  }
  if (advancePaid > grandTotal) {
  toast.error("Advance paid cannot exceed Grand Total");
  return;
}

if (cashAmount + upiAmount !== advancePaid) {
  toast.error("Cash + UPI must exactly match Advance Paid");
  return;
}

  try {
    const customer_id = await ensureCustomerExists();
    await ensureEmployeeExists();

    const payload = {
      customer_id,
      customer_name: customerName,
      phone_number: customerPhone,
      gst_number: gstNumber || null,

      staff_name: staffName,
      staff_phone: staffPhone,

      bank_id: selectedBankId,

      tax_gst_percent: gstPercent,
      advance_paid: Number(advancePaid),
      cash_amount: Number(cashAmount),
      upi_amount: Number(upiAmount),

      status: "DRAFT",
      print_required: false,

      products: billProducts.map((p) => ({
        product_id: p.product_id,
        quantity: Number(p.sell_qty),
        product_quantity: p.product_quantity,
        rate: Number(p.rate),
      })),
    };

    if (isEdit) {
      await api.put(`/customer-billing/${id}`, payload);
    } else {
      await createCustomerBilling(payload);
    }

    toast.success("Draft saved successfully");

    // ✅ RESET BILLING PAGE STATE (IMPORTANT PART)
    resetBillingPage();

  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to save draft");
  }
};


const handleDiscard = () => {
  setCustomerName("");
  setCustomerPhone("");
  setCustomerAddress("");
  setSelectedCustomerId(null);

  setStaffName("");
  setStaffPhone("");
  setSelectedEmployeeId(null);

  setBillProducts([]);
  setSelectedProduct(null);
  setSellQty("");

  setAdvancePaid(0);
  setCashAmount(0);
  setUpiAmount(0);
  setGstNumber("");
  setGstPercent(18);
  setSelectedBankId(null);

  toast.info("Billing discarded");
};

useEffect(() => {
  getCompanyDetails().then((res) => {
    setCompany(res);
  });
}, []);
useEffect(() => {
  if (!isEdit || !selectedCustomerId || !customers.length) return;

  const customer = customers.find(c => c.id === selectedCustomerId);
  if (customer) {
    setCustomerAddress(customer.address || "");
  }
}, [customers, selectedCustomerId, isEdit]);

  return (
    <div className="product-billing">
      <div className="row gy-4">

        {/* ================= LEFT ================= */}
        <div className="col-md-7">
          <div className="product-list-items">
            <div className="row gy-4">
             {/* ================= STAFF (SMALL – TOP LEFT) ================= */}
<div className="col-lg-12">
  <div className="product-list-box">
    <h5 className="box-title">
                    <i className="fi fi-tr-user-pen"></i> Staff Details
                  </h5>
    <div className="row g-2">

      {/* STAFF NAME */}
      <div className="col-md-6 position-relative">
        <label className="form-label">Staff Name</label>
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
        <label className="form-label">Staff Phone</label>
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
                                    onFocus={() => {
                                      if (customerName) {
                                        setCustomerSuggestions(customers);
                                      }
                                    }}
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

                              <td>{p.product_quantity}</td>

                              <td>{p.sell_qty}</td>

                              <td>{isEdit ? "-" : p.stock}</td>

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

        {/* <input
          className="form-control form-control-sm mt-2"
          placeholder="GST Number"
          value={gstNumber}
          onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
        /> */}
    <input
  className="form-control form-control-sm mt-2"
  placeholder="GST Number"
  value={gstNumber}
  onChange={(e) => {
    const value = e.target.value.toUpperCase();

    // ✅ Limit 15 characters
    if (value.length > 15) return;

    setGstNumber(value);
  }}
  maxLength={15}
  pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
  title="Enter Valid GST Number (Example: 22AAAAA0000A1Z5)"
  required
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
    <div className="row bill-info justify-content-end">
        {company && (
            <div className="col-6">
              <div className="label">Bill From</div>
              <div className="name">{company.company_name}</div>
              <div className="text">{company.company_address}</div>
              <div className="text">
                {company.district}, {company.state} - {company.pincode}
              </div>
            </div>
          )}



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
        {p.product_name} ({p.product_quantity})

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
      <option value={48}>48%</option>
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
  onWheel={(e) => e.target.blur()}
  onChange={(e) => {
    let val = Number(e.target.value) || 0;

    // ❌ prevent paying more than bill
    if (val > grandTotal) {
      val = grandTotal;
      toast.warn("Advance adjusted to Grand Total");
    }

    setAdvancePaid(val);

    // default full amount to cash (can change later)
    setCashAmount(val);
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
    {/* <div className="col-4">
      <div
        className={`radio-card ${paymentMode === "card" ? "active" : ""}`}
        onClick={() => setPaymentMode("card")}
      >
        <div className="icon">
          <i className="bi bi-credit-card-fill"></i>
        </div>
        <span>CARD</span>
      </div>
    </div> */}
  </div>
</div>



    {/* Action */}
    <button className="main-btn w-100 text-center d-block" onClick={handleSaveBilling}>
      <i className="fi fi-tr-print me-2"></i>Save & Print
    </button>

          <div className="invoice-footer">
          <button
            type="button"
            className="btn btn-sm me-3"
            onClick={handleSaveDraft}
          >
            <i className="bi bi-save me-2"></i>
            Save Draft
          </button>

          <button
            type="button"
            className="btn btn-sm me-3"
            onClick={handleDiscard}
          >
            <i className="bi bi-x-circle-fill me-2"></i>
            Discard
          </button>
        </div>

  </div>
</div>


      </div>
    </div>
  );
};

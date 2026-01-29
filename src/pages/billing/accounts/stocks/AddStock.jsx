import { useEffect, useState } from "react";
import { getProducts } from "../../../../services/product.service";
import { getVendors, createVendor } from "../../../../services/vendor.service";
import {
  createVendorStock,
  updateVendorStock,
} from "../../../../services/vendorStock.service";
import { toast } from "react-toastify";

export const AddStock = ({ editData = null, onSuccess, closeModal }) => {
  const isEdit = Boolean(editData);

  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [showVendorSuggestions, setShowVendorSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  const [addedProducts, setAddedProducts] = useState([]);

 const [form, setForm] = useState({
  vendor_name: "",
  vendor_phone: "",
  product_id: "",        // ✅ ADD
  product_code: "",
  product_name: "",
  product_brand: "",
  product_category: "",
  product_quantity: "",
  total_stock: "",
  entry_date: "",
  entry_time: "",
});


  /* ================= LOAD DATA ================= */
  useEffect(() => {
    getProducts().then((data) => {
      setProducts(
        (data || []).map((p) => ({
          ...p,
          brand: p.brand ?? p.brand_name ?? "",
          category: p.category ?? p.category_name ?? "",
          quantity: p.quantity ?? p.quantity_name ?? "",
        }))
      );
    });

    getVendors().then((v) => setVendors(v || []));

    const now = new Date();
    setForm((f) => ({
      ...f,
      entry_date: now.toISOString().split("T")[0],
      entry_time: now.toTimeString().slice(0, 5),
    }));
  }, []);

   useEffect(() => {
  const {
    product_name,
    product_brand,
    product_category,
    product_quantity,
  } = form;

  // Only run when ALL are selected
  if (
    product_name &&
    product_brand &&
    product_category &&
    product_quantity
  ) {
    const matchedProduct = products.find(
      (p) =>
        p.product_name === product_name &&
        p.brand === product_brand &&
        p.category === product_category &&
        p.quantity === product_quantity
    );

    setForm((f) => ({
      ...f,
      product_id: matchedProduct?.id || "",
      product_code: matchedProduct?.product_code || "",
    }));
  }
}, [
  form.product_name,
  form.product_brand,
  form.product_category,
  form.product_quantity,
  products,
]);

  /* ================= PREFILL EDIT ================= */
  useEffect(() => {
    if (!editData) return;

    setForm({
      vendor_name: editData.vendor_name,
      vendor_phone: editData.vendor_phone,
      product_name: editData.product_name,
      product_code: editData.product_id,
      product_brand: editData.product_brand,
      product_category: editData.product_category,
      product_quantity: editData.product_quantity,
      total_stock: editData.total_stock,
      entry_date: editData.entry_date
        ? new Date(editData.entry_date).toISOString().split("T")[0]
        : "",
      entry_time: editData.entry_time || "",
    });

    setFilteredProducts(
      products.filter(
        (p) =>
          p.product_name.toLowerCase() ===
          editData.product_name.toLowerCase()
      )
    );
  }, [editData, products]);

  /* ================= VENDOR AUTOCOMPLETE ================= */
  const handleVendorNameChange = (value) => {
    setForm((f) => ({ ...f, vendor_name: value }));

    if (!value) {
      setShowVendorSuggestions(false);
      return;
    }

    const matches = vendors.filter((v) =>
      `${v.first_name} ${v.last_name}`
        .toLowerCase()
        .includes(value.toLowerCase())
    );

    setFilteredVendors(matches);
    setShowVendorSuggestions(true);
  };

  const handleVendorPhoneChange = (value) => {
    setForm((f) => ({ ...f, vendor_phone: value }));

    if (!value) {
      setShowVendorSuggestions(false);
      return;
    }

    const matches = vendors.filter((v) =>
      v.phone.toString().includes(value)
    );

    setFilteredVendors(matches);
    setShowVendorSuggestions(true);
  };

  const selectVendor = (vendor) => {
    setForm((f) => ({
      ...f,
      vendor_name: `${vendor.first_name} ${vendor.last_name}`,
      vendor_phone: vendor.phone,
    }));
    setShowVendorSuggestions(false);
  };

  /* ================= PRODUCT ================= */
  const handleProductChange = (e) => {
  const name = e.target.value;

  const related = products.filter(
    (p) => p.product_name.toLowerCase() === name.toLowerCase()
  );

  setFilteredProducts(related);

  setForm({
    ...form,
    product_id: "",        // ❌ not loaded here
    product_code: "",      // ❌ not loaded here
    product_name: name,
    product_brand: "",
    product_category: "",
    product_quantity: "",
    total_stock: "",
  });
};


  /* ================= ADD PRODUCT ================= */
  const addProduct = () => {
    if (
      !form.product_code ||
      !form.product_brand ||
      !form.product_category ||
      !form.product_quantity ||
      !form.total_stock
    ) {
      toast.error("Fill product details");
      return;
    }
    if (!form.product_id) {
        toast.error("Invalid product selection");
        return;
      }
    setAddedProducts((prev) => [
  ...prev,
  {
    product_id: form.product_id,
     
    product_code: form.product_code,   // ✅ STRING
    product_name: form.product_name,
    product_brand: form.product_brand,
    product_category: form.product_category,
    product_quantity: form.product_quantity,
    total_stock: form.total_stock,
  },
]);


    setForm((f) => ({
      ...f,
      product_name: "",
      product_code: "",
      product_brand: "",
      product_category: "",
      product_quantity: "",
      total_stock: "",
    }));

    setFilteredProducts([]);
  };
  const toMysqlTime = (time) => {
  if (!time) return "";
  return time.length === 5 ? `${time}:00` : time;
  
};
const findExistingVendor = () => {
  return vendors.find(
    (v) =>
      v.phone === form.vendor_phone ||
      `${v.first_name} ${v.last_name}`.toLowerCase() ===
        form.vendor_name.toLowerCase()
  );
};


  /* ================= SUBMIT ================= */
 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    /* ================= ADD MODE ================= */
   if (!isEdit) {
  if (!form.vendor_name || !form.vendor_phone) {
    toast.error("Vendor details required");
    return;
  }

  if (addedProducts.length === 0) {
    toast.error("Please add at least one product");
    return;
  }

  let vendor = findExistingVendor();

  if (!vendor) {
    const [first_name, ...rest] = form.vendor_name.split(" ");
    const last_name = rest.join(" ");

    const res = await createVendor({
      first_name,
      last_name,
      phone: form.vendor_phone,
    });

    vendor = res.data;
  }

  await createVendorStock({
    vendor_name: form.vendor_name,
    vendor_phone: form.vendor_phone,
    entry_date: form.entry_date,
    entry_time: toMysqlTime(form.entry_time),

    products: addedProducts.map((p) => ({
      product_id: p.product_id,
      product_quantity: p.product_quantity,
      total_stock: Number(p.total_stock),
    })),
  });

  toast.success("All stock added successfully");
}


    /* ================= EDIT MODE ================= */
    else {
      await updateVendorStock(editData.id, {
        vendor_name: form.vendor_name,
        vendor_phone: form.vendor_phone,

        product_id: editData.product_id,   // ✅ FIXED
        product_code: form.product_code,
        product_name: form.product_name,

        product_brand: form.product_brand,
        product_category: form.product_category,
        product_quantity: form.product_quantity,
        total_stock: form.total_stock,

        entry_date: form.entry_date,
       entry_time: toMysqlTime(form.entry_time),

      });

      toast.success("Stock updated successfully");
    }

    onSuccess?.();
    closeModal?.();

  } catch (err) {
    toast.error(err.response?.data?.message || "Operation failed");
  } finally {
    setLoading(false);
  }
};

/* ================= EDIT ADDED PRODUCT ================= */
const handleEditAddedProduct = (index) => {
  const p = addedProducts[index];

  setForm((f) => ({
    ...f,
    product_name: p.product_name,
    product_code: p.product_id,
    product_brand: p.product_brand,
    product_category: p.product_category,
    product_quantity: p.product_quantity,
    total_stock: p.total_stock,
  }));

  setFilteredProducts(
    products.filter(
      (x) =>
        x.product_name.toLowerCase() ===
        p.product_name.toLowerCase()
    )
  );

  // remove from list (will re-add after edit)
  setAddedProducts((prev) => prev.filter((_, i) => i !== index));
};

/* ================= DELETE ADDED PRODUCT ================= */
const handleDeleteAddedProduct = (index) => {
  if (!window.confirm("Remove this product?")) return;

  setAddedProducts((prev) => prev.filter((_, i) => i !== index));
};
const toRoman = (num) => {
  const romans = ["I","II","III","IV","V","VI","VII","VIII","IX","X"];
  return romans[num] || num + 1;
};


  /* ================= UI ================= */
  return (
    <form onSubmit={handleSubmit} className="row gy-3">

      {/* Vendor */}
      <div className="col-md-6 position-relative">
        <label>Vendor Name</label>
        <input
          className="form-control"
          value={form.vendor_name}
          onChange={(e) => handleVendorNameChange(e.target.value)}
        />
        {showVendorSuggestions && (
          <ul className="list-group position-absolute w-100 z-3">
            {filteredVendors.map((v) => (
              <li
                key={v.id}
                className="list-group-item list-group-item-action"
                onClick={() => selectVendor(v)}
              >
                {v.first_name} {v.last_name} — {v.phone}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="col-md-6">
        <label>Vendor Phone</label>
        <input
          className="form-control"
          value={form.vendor_phone}
          onChange={(e) => handleVendorPhoneChange(e.target.value)}
        />
      </div>

      {/* ENTRY DATE & TIME (ONE FOR ALL PRODUCTS) */}
      <div className="col-md-4">
        <label>Entry Date</label>
        <input
          type="date"
          className="form-control"
          value={form.entry_date}
          onChange={(e) =>
            setForm({ ...form, entry_date: e.target.value })
          }
        />
      </div>

      <div className="col-md-4">
        <label>Entry Time</label>
        <input
          type="time"
          className="form-control"
          value={form.entry_time}
          onChange={(e) =>
            setForm({ ...form, entry_time: e.target.value })
          }
        />
      </div>

      {/* Product */}
      <div className="col-md-6">
        <label>Product Name</label>
        <select
          className="form-select"
          value={form.product_name}
          onChange={handleProductChange}
        >
          <option value="">Select</option>
          {[...new Set(products.map((p) => p.product_name))].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      <div className="col-md-6">
        <label>Product Code</label>
        <input className="form-control" value={form.product_code} readOnly />
      </div>

      {/* Brand / Category / Quantity */}
      <div className="col-md-4">
        <label>Brand</label>
        <select
          className="form-select"
          value={form.product_brand}
          onChange={(e) =>
            setForm({ ...form, product_brand: e.target.value, product_category: "", product_quantity: "" })
          }
        >
          <option value="">Select</option>
          {[...new Set(filteredProducts.map(p => p.brand))].map(b => (
            <option key={b}>{b}</option>
          ))}
        </select>
      </div>

      <div className="col-md-4">
        <label>Category</label>
        <select
          className="form-select"
          value={form.product_category}
          onChange={(e) =>
            setForm({ ...form, product_category: e.target.value, product_quantity: "" })
          }
        >
          <option value="">Select</option>
          {filteredProducts
            .filter(p => p.brand === form.product_brand)
            .map((p, i) => (
              <option key={i}>{p.category}</option>
            ))}
        </select>
      </div>

      <div className="col-md-4">
        <label>Quantity</label>
      <select
          className="form-select"
          value={form.product_quantity}
          onChange={(e) =>
            setForm({ ...form, product_quantity: e.target.value })
          }
        >
          <option value="">Select</option>
          {filteredProducts
            .filter(
              (p) =>
                p.brand === form.product_brand &&
                p.category === form.product_category
            )
            .map((p, i) => (
              <option key={i}>{p.quantity}</option>
            ))}
        </select>

      </div>

      <div className="col-md-4">
        <label>Total Stock</label>
        <input
          type="number"
          className="form-control"
          value={form.total_stock}
          onChange={(e) =>
            setForm({ ...form, total_stock: e.target.value })
          }
        />
      </div>

      {!isEdit && (
        <div className="col-md-4 d-flex align-items-end">
          <button
            type="button"
            className="btn main-btn w-100"
            onClick={addProduct}
          >
            ➕ Add Product
          </button>

        </div>
      )}
      {/* ================= ADDED PRODUCTS TABLE ================= */}
{!isEdit && (
  <div className="col-12 mt-3">
    <label className="form-label">Added Products</label>

    {addedProducts.length === 0 ? (
      <div className="form-control text-muted">
        No products added
      </div>
    ) : (
      <div className="table-responsive">
  <table className="table table-bordered table-sm align-middle text-center">
    <thead className="table-light">
      <tr>
        <th style={{ width: "60px" }}>#</th>
        <th>Product</th>
        <th>Brand</th>
        <th>Category</th>
        <th>Quantity</th>
        <th>Stock</th>
        <th>Actions</th>
      </tr>
    </thead>


   <tbody>
  {addedProducts.map((p, i) => (
    <tr key={i}>
      <td className="fw-bold text-center">{toRoman(i)}</td>

      <td className="fw-semibold text-center">{p.product_name}</td>
      <td className="text-center">{p.product_brand}</td>
      <td className="text-center">{p.product_category}</td>
      <td className="text-center">{p.product_quantity}</td>
      <td className="fw-bold text-center">{p.total_stock}</td>

      <td>
        <div className="d-flex justify-content-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-warning"
            onClick={() => handleEditAddedProduct(i)}
          >
            <i className="bi bi-pencil"></i>
          </button>

          <button
            type="button"
            className="btn btn-sm btn-danger"
            onClick={() => handleDeleteAddedProduct(i)}
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>

  </table>
</div>

    )}
  </div>
)}


      <div className="col-12 text-end">
        <button className="btn main-btn" disabled={loading}>
          {loading ? "Saving..." : isEdit ? "Update Stock" : "Submit All Stock"}
        </button>
      </div>
    </form>
  );
};

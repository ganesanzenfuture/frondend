import React, { useEffect, useState } from "react";
import { getBrands } from "../../../services/brand.service";
import { getCategories } from "../../../services/category.service";
import { getQuantity } from "../../../services/quantity.service";
import { createProduct, updateProduct } from "../../../services/product.service";
import { toast } from "react-toastify";

export const AddProduct = ({ show, onClose, onSuccess, editData }) => {
  /* ================= MASTER DATA ================= */
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allQuantities, setAllQuantities] = useState([]);
  const [filteredQuantities, setFilteredQuantities] = useState([]);

  /* ================= FORM DATA ================= */
  const [productName, setProductName] = useState("");
  const [brandCategory, setBrandCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  /* ================= ERRORS ================= */
  const [errors, setErrors] = useState({});

  /* ================= LOAD MASTER DATA ================= */
  useEffect(() => {
    if (!show) return;

    const loadData = async () => {
      try {
        const [b, c, q] = await Promise.all([
          getBrands(),
          getCategories(),
          getQuantity(),
        ]);

        setBrands(b);
        setCategories(c);
        setAllQuantities(q);
      } catch (err) {
        console.error("Failed to load master data", err);
        toast.error("Failed to load master data ❌");
      }
    };

    loadData();
  }, [show]);

  /* ================= RESET FORM (ADD MODE) ================= */
  useEffect(() => {
    if (show && !editData) {
      setProductName("");
      setBrandCategory("");
      setQuantity("");
      setPrice("");
      setFilteredQuantities([]);
      setErrors({});
    }
  }, [show, editData]);

  /* ================= PREFILL (EDIT MODE) ================= */
  useEffect(() => {
    if (
      !editData ||
      !brands.length ||
      !categories.length ||
      !allQuantities.length
    )
      return;

    const brand = brands.find((b) => b.name === editData.brand_name);
    if (!brand) return;

    const category = categories.find(
      (c) =>
        c.name === editData.category_name &&
        c.brand_id === brand.id
    );
    if (!category) return;

    const qty = allQuantities.find(
      (q) =>
        q.name === editData.quantity_name &&
        q.brand_id === brand.id &&
        q.category_id === category.id
    );

    setProductName(editData.product_name);
    setPrice(String(editData.price));
    setBrandCategory(`${brand.id}-${category.id}`);

    if (qty) setQuantity(String(qty.id));
  }, [editData, brands, categories, allQuantities]);

  /* ================= BRAND + CATEGORY OPTIONS ================= */
  const brandCategoryOptions = categories
    .map((c) => {
      const brand = brands.find((b) => b.id === c.brand_id);
      if (!brand) return null;

      return {
        label: `${brand.name} - ${c.name}`,
        value: `${brand.id}-${c.id}`,
      };
    })
    .filter(Boolean);

  /* ================= FILTER QUANTITY ================= */
  useEffect(() => {
    if (!brandCategory) {
      setFilteredQuantities([]);
      return;
    }

    const [brandId, categoryId] = brandCategory.split("-").map(Number);

    const filtered = allQuantities.filter(
      (q) => q.brand_id === brandId && q.category_id === categoryId
    );

    setFilteredQuantities(filtered);

    if (!editData) setQuantity("");
  }, [brandCategory, allQuantities, editData]);

  /* ================= VALIDATION ================= */
  const validate = () => {
    const err = {};

    if (!productName || !productName.trim()) {
      err.productName = "Product name is required";
    } else if (productName.trim().length < 3) {
      err.productName = "Product name must be at least 3 characters";
    }

    if (!brandCategory) {
      err.brandCategory = "Select brand and category";
    }

    if (!quantity) {
      err.quantity = "Select quantity";
    }

    if (!price) {
      err.price = "Price is required";
    } else if (isNaN(price)) {
      err.price = "Price must be a number";
    } else if (Number(price) <= 0) {
      err.price = "Price must be greater than 0";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  const [brandId, categoryId] = brandCategory.split("-").map(Number);

  const selectedBrand = brands.find((b) => b.id === brandId);
  const selectedCategory = categories.find(
    (c) => c.id === categoryId && c.brand_id === brandId
  );
  const selectedQuantity = allQuantities.find(
    (q) => q.id === Number(quantity)
  );

  if (!selectedBrand || !selectedCategory || !selectedQuantity) {
    toast.error("Invalid selection ❌");
    return;
  }

  /* ✅ SEND NAMES ONLY */
  const payload = {
    product_name: productName.trim(),

    brand: selectedBrand.name,        // ✅ VARCHAR
    category: selectedCategory.name,  // ✅ VARCHAR
    quantity: selectedQuantity.name,  // ✅ VARCHAR

    price: Number(price),
  };

  try {
    if (editData) {
      await updateProduct(editData.id, payload);
      toast.success("Product updated successfully ✅");
    } else {
      await createProduct(payload);
      toast.success("Product added successfully ");
    }

    onSuccess?.();
    onClose();
  } catch (err) {
    console.error("Save failed", err.response?.data || err.message);
    toast.error(err.response?.data?.message || "Failed to save product ❌");
  }
};


  /* ================= RENDER ================= */
  if (!show) return null;

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            {/* HEADER */}
            <div className="modal-header">
              <h5 className="modal-title">
                {editData ? "Update Product" : "Add Product"}
              </h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>

            {/* BODY */}
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Product Name</label>
                    <input
                      className={`form-control ${
                        errors.productName ? "is-invalid" : ""
                      }`}
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                    />
                    {errors.productName && (
                      <div className="invalid-feedback">
                        {errors.productName}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Brand - Category</label>
                    <select
                      className={`form-select ${
                        errors.brandCategory ? "is-invalid" : ""
                      }`}
                      value={brandCategory}
                      onChange={(e) => setBrandCategory(e.target.value)}
                    >
                      <option value="">Select</option>
                      {brandCategoryOptions.map((bc) => (
                        <option key={bc.value} value={bc.value}>
                          {bc.label}
                        </option>
                      ))}
                    </select>
                    {errors.brandCategory && (
                      <div className="invalid-feedback">
                        {errors.brandCategory}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Quantity</label>
                    <select
                      className={`form-select ${
                        errors.quantity ? "is-invalid" : ""
                      }`}
                      value={quantity}
                      disabled={!brandCategory}
                      onChange={(e) => setQuantity(e.target.value)}
                    >
                      <option value="">
                        {brandCategory
                          ? "Select Quantity"
                          : "Select Brand-Category first"}
                      </option>
                      {filteredQuantities.map((q) => (
                        <option key={q.id} value={q.id}>
                          {q.name}
                        </option>
                      ))}
                    </select>
                    {errors.quantity && (
                      <div className="invalid-feedback">
                        {errors.quantity}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Price</label>
                    <input
                      type="number"
                      className={`form-control ${
                        errors.price ? "is-invalid" : ""
                      }`}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                    {errors.price && (
                      <div className="invalid-feedback">
                        {errors.price}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button type="submit" className="btn main-btn">
                  {editData ? "Update Product" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* BACKDROP */}
      <div className="modal-backdrop fade show"></div>
    </>
  );
};

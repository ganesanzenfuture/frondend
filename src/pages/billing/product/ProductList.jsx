import { useEffect, useState } from "react";
import { ProductTable } from "../../../components/tables/ProductTable";
import { AddProduct } from "./AddProduct";
import { getBrands } from "../../../services/brand.service";
import { getCategories } from "../../../services/category.service";
import "./product.css";

export const ProductList = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editProduct, setEditProduct] = useState(null);

  // filters
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");

  // dropdown data
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      const brandData = await getBrands();
      const categoryData = await getCategories();

      setBrands(brandData || []);
      setCategories(categoryData || []);
    } catch (err) {
      console.error("Failed to load filters", err);
    }
  };

  return (
    <div className="product_detail">
      {/* HEADER */}
      <div className="product-header mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">

          {/* FILTERS */}
          <div className="d-flex align-items-center gap-2 flex-wrap">

            {/* BRAND */}
            <select
              className="form-select form-select-sm product-filter"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            >
              <option value="">Brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>

            {/* CATEGORY */}
            <select
              className="form-select form-select-sm product-filter"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>


            {/* SEARCH */}
            <div className="search-pill">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

          </div>

          {/* ADD */}
          <button
            className="btn main-btn"
            onClick={() => {
              setEditProduct(null);
              setShowAddModal(true);
            }}
          >
            <i className="bi bi-plus-lg me-1"></i>
            Add Product
          </button>

        </div>
      </div>

      {/* TABLE */}
      <ProductTable
        refreshKey={refreshKey}
        search={search}
        brand={brand}
        category={category}
        onEdit={(product) => {
          setEditProduct(product);
          setShowAddModal(true);
        }}
      />

      {/* MODAL */}
      <AddProduct
        show={showAddModal}
        editData={editProduct}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          setRefreshKey((k) => k + 1);
        }}
      />
    </div>
  );
};

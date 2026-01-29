import React, { useEffect, useState } from "react";
import {
  getProducts,
  updateProductStock,
} from "../../../../services/product.service";
import { toast } from "react-toastify";

const ADMIN_PASSWORD = "1234";

const Currentstock = ({
  refreshKey = 0,
  search = "",
  brand = "",
  category = "",
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stockInputs, setStockInputs] = useState({});
  const [password, setPassword] = useState("");

  // controls which row + action is active
  const [activeAction, setActiveAction] = useState(null); 
  // unlocked row id after password success
  const [unlockedRowId, setUnlockedRowId] = useState(null);

  /* ================= LOAD PRODUCTS ================= */
  const fetchProducts = async () => {
    try {
      const data = await getProducts();

      const normalized = (data || []).map((p) => ({
        ...p,
        brand: p.brand ?? p.brand_name ?? "-",
        category: p.category ?? p.category_name ?? "-",
        quantity: p.quantity ?? p.quantity_name ?? "-",
        stock: Number(p.stock ?? 0),
        price: Number(p.price ?? 0),
      }));

      setProducts(normalized);

      // preload stock values
      const map = {};
      normalized.forEach((p) => {
        map[p.id] = p.stock;
      });
      setStockInputs(map);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [refreshKey]);

  /* ================= PASSWORD UNLOCK ================= */
  const unlockRow = () => {
    if (!password) {
      toast.error("Enter admin password");
      return;
    }

    if (password !== ADMIN_PASSWORD) {
      toast.error("Wrong password");
      return;
    }

    setUnlockedRowId(activeAction.id);
    toast.success("Unlocked");
  };

  /* ================= SAVE / CLEAR STOCK ================= */
  const confirmAction = async (productId, type) => {
    try {
      if (type === "edit") {
        await updateProductStock(
          productId,
          Number(stockInputs[productId])
        );
        toast.success("Stock updated");
      }

      if (type === "delete") {
        await updateProductStock(productId, 0);
        toast.success("Stock cleared");
      }

      fetchProducts();
    } catch {
      toast.error("Operation failed");
    } finally {
      setPassword("");
      setActiveAction(null);
      setUnlockedRowId(null);
    }
  };

  /* ================= FILTER ================= */
  const filteredProducts = products.filter((p) => {
    const q = (search || "").toLowerCase();
    const matchSearch =
      p.product_name.toLowerCase().includes(q) ||
      p.product_code.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q);

    const matchBrand = brand ? p.brand === brand : true;
    const matchCategory = category ? p.category === category : true;

    return matchSearch && matchBrand && matchCategory;
  });

  if (loading) {
    return <p className="text-center">Loading products...</p>;
  }

  /* ================= UI ================= */
  return (
    <div className="common-table-wrapper">
      <table className="common-table table-striped align-middle">
        <thead>
          <tr>
            <th>Product Code</th>
            <th>Product Name</th>
            <th>Details</th>
            <th className="text-center">Stock</th>
            <th>Selling Price</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredProducts.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center">
                No products found
              </td>
            </tr>
          ) : (
            filteredProducts.map((p) => (
              <tr key={p.id}>
                <td>{p.product_code}</td>
                <td>{p.product_name}</td>

                <td>
                  <div className="fw-semibold">{p.brand}</div>
                  <div className="text-muted small">{p.category}</div>
                  <span className="badge bg-secondary">{p.quantity}</span>
                </td>

                {/* 🔒 STOCK FIELD */}
                <td className="text-center">
                  <input
                    type="number"
                    className="form-control form-control-sm text-center mx-auto"
                    style={{ width: "90px" }}
                    value={stockInputs[p.id] ?? 0}
                    disabled={unlockedRowId !== p.id}
                    onChange={(e) =>
                      setStockInputs((prev) => ({
                        ...prev,
                        [p.id]: e.target.value,
                      }))
                    }
                  />
                </td>

                <td>{p.price.toFixed(2)}</td>

                {/* 🔐 ACTIONS */}
                <td className="text-center" style={{ minWidth: "200px" }}>
                  {/* ACTION ICONS */}
                  <div className="d-flex justify-content-center gap-2 mb-1">
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() =>
                        setActiveAction({ id: p.id, type: "edit" })
                      }
                    >
                      <i className="bi bi-pencil"></i>
                    </button>

                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() =>
                        setActiveAction({ id: p.id, type: "delete" })
                      }
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>

                  {/* 🔑 PASSWORD BOX */}
                  {activeAction?.id === p.id && unlockedRowId !== p.id && (
                            <div
                              className="mx-auto mt-2 p-2 border rounded shadow-sm bg-white"
                              style={{
                                width: "160px",
                                textAlign: "center",
                              }}
                            >
                              <div className="small text-muted mb-1">
                                Admin Password
                              </div>

                              <input
                                      type="password"
                                      className="form-control form-control-sm mb-2"
                                      placeholder=""
                                      value={password}
                                      onChange={(e) => setPassword(e.target.value)}

                                      autoComplete="new-password"
                                      name="admin-auth"
                                      inputMode="text"
                                      autoCorrect="off"
                                      autoCapitalize="off"
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
                  {unlockedRowId === p.id && (
                        <div
                          className="mx-auto mt-2 p-2 border rounded bg-light text-center"
                          style={{ width: "160px" }}
                        >
                          <button
                            className="btn btn-sm btn-success w-100"
                            onClick={() =>
                              confirmAction(p.id, activeAction.type)
                            }
                          >
                            ✅ Confirm
                          </button>
                        </div>
                      )}

                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Currentstock;

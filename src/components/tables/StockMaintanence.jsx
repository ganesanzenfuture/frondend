import { useEffect, useState } from "react";
import {
  getVendorStocks,
  deleteVendorStock,
  deleteVendorStockEntry,
} from "../../services/vendorStock.service";
import { toast } from "react-toastify";
import { AddStock } from "../../pages/billing/accounts/stocks/AddStock";
import "../../pages/billing/accounts/stocks/stock.model.css";

export const StockMaintanence = ({ search }) => {
  const [stocks, setStocks] = useState([]);
  const [groupedStocks, setGroupedStocks] = useState([]);

  const [viewEntry, setViewEntry] = useState(null);
  const [editEntry, setEditEntry] = useState(null);

  /* ================= LOAD ================= */
  useEffect(() => {
    loadStocks();
  }, []);

  const loadStocks = async () => {
    try {
      const data = await getVendorStocks();
      setStocks(data || []);
      groupStockEntries(data || []);
    } catch {
      toast.error("Failed to load stock data");
    }
  };

  /* ================= GROUP LOGIC ================= */
  const groupStockEntries = (rows) => {
  const grouped = Object.values(
    rows.reduce((acc, row) => {
      // ✅ USE entry_id FROM DB
      const key = row.entry_id;

      if (!acc[key]) {
        acc[key] = {
          entry_id: row.entry_id,      // 🔥 REQUIRED
          vendor_name: row.vendor_name,
          vendor_phone: row.vendor_phone,
          entry_date: row.entry_date,
          entry_time: row.entry_time,
          products: [],
        };
      }

      acc[key].products.push(row);
      return acc;
    }, {})
  );

  setGroupedStocks(grouped);
};


  /* ================= DELETE FULL ENTRY ================= */
 const handleDeleteEntry = async (entry) => {
  if (!window.confirm("Delete this stock entry?")) return;

  try {
    await deleteVendorStockEntry(entry.entry_id); // ✅ ONLY ID
    toast.success("Stock entry deleted");
    loadStocks();
  } catch (err) {
    toast.error("Delete failed");
  }
};

  /* ================= DELETE SINGLE PRODUCT ================= */
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await deleteVendorStock(productId);
      toast.success("Product deleted");
      setViewEntry(null);
      loadStocks();
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ================= SEARCH ================= */
  const filteredEntries = groupedStocks.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();

    return (
      e.vendor_name?.toLowerCase().includes(q) ||
      e.vendor_phone?.includes(q)
    );
  });

  return (
    <>
      {/* ================= MAIN TABLE ================= */}
      <div className="common-table-wrapper">
        <table className="common-table table-striped">
          <thead>
            <tr>
              <th className="text-center">#</th>
              <th>Vendor Name</th>
              <th>Vendor Phone</th>
              <th>Date</th>
              <th>Time</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">
                  No stock entries found
                </td>
              </tr>
            ) : (
              filteredEntries.map((e, i) => (
                <tr key={i}>
                  <td className="text-center">{i + 1}</td>
                  <td>{e.vendor_name}</td>
                  <td>{e.vendor_phone}</td>
                  <td>
                    {new Date(e.entry_date).toLocaleDateString("en-IN")}
                  </td>
                  <td>{e.entry_time}</td>

                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-secondary me-2"
                      onClick={() => setViewEntry(e)}
                    >
                      <i className="bi bi-eye"></i>
                    </button>

                    {/* <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => setEditEntry(e.products[0])}
                    >
                      <i className="bi bi-pencil"></i>
                    </button> */}
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteEntry(e)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>

                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= VIEW MODAL ================= */}
      {viewEntry && (
        <div className="stock-modal-overlay">
          <div className="stock-modal-box">
            <div className="stock-modal-header">
              <h5>Stock Entry Details</h5>
              <button onClick={() => setViewEntry(null)}>✕</button>
            </div>

            <table className="table table-bordered table-sm align-middle">
              <thead className="table-light">
                <tr>
                  <th className="text-center">#</th>
                  <th className="text-center">Product</th>
                  <th className="text-center">Brand</th>
                  <th className="text-center">Category</th>
                  <th className="text-center">Quantity</th>
                  <th className="text-center">Stock</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {viewEntry.products.map((p, i) => (
                  <tr key={p.id}>
                    <td className="text-center">{i + 1}</td>
                    <td className="text-center">{p.product_name}</td>
                    <td className="text-center">{p.product_brand}</td>
                    <td className="text-center">{p.product_category}</td>
                    <td className="text-center">{p.product_quantity}</td>
                    <td className="text-center">{p.total_stock}</td>
                    <td className="text-center">
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => {
                          setEditEntry(p);
                          setViewEntry(null);
                        }}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteProduct(p.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= EDIT MODAL ================= */}
      {editEntry && (
        <div className="stock-modal-overlay">
          <div className="stock-modal-box">
            <div className="stock-modal-header">
              <h5>Edit Stock</h5>
              <button onClick={() => setEditEntry(null)}>✕</button>
            </div>

            <AddStock
              editData={editEntry}
              onSuccess={() => {
                setEditEntry(null);
                loadStocks();
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

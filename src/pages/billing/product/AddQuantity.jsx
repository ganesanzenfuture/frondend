import { useEffect, useState } from "react";
import {
  createQuantity,
  getQuantity,
  updateQuantity,
  deleteQuantity,
} from "../../../services/quantity.service";
import { getBrandCategoryDropdown } from "../../../services/category.service";
import { toast } from "react-toastify";
export const AddQuantity = () => {
  const [brandCategories, setBrandCategories] = useState([]);
  const [quantities, setQuantities] = useState([]);

  /* ================= CREATE ================= */
  const [selectedBC, setSelectedBC] = useState("");
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("Qty");

  /* ================= EDIT ================= */
  const [editingId, setEditingId] = useState(null);
  const [editBC, setEditBC] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editUnit, setEditUnit] = useState("Qty");

  const [error, setError] = useState("");

  const UNITS = ["Qty", "Kg", "Litre", "Pack","Unit","Others"];

  useEffect(() => {
    loadData();
  }, []);

  /* ================= LOAD DATA ================= */
  const loadData = async () => {
    try {
      const bcData = await getBrandCategoryDropdown();
      const qtyData = await getQuantity();

      setBrandCategories(bcData);
      setQuantities(qtyData);
    } catch (err) {
      console.error("Load error", err);
    }
  };

  /* ================= CREATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBC || !amount) {
      setError("Brand & Category and Quantity are required");
      return;
    }

    const [brand_id, category_id] = selectedBC.split("-");

    try {
      await createQuantity({
        brand_id: Number(brand_id),
        category_id: Number(category_id),
        name: `${amount} ${unit}`,
      });

      setSelectedBC("");
      setAmount("");
      setUnit("Qty");
      setError("");
      loadData();
      toast.success("Quantity Added sucessfully");
    } catch (err) {
      setError(err.response?.data?.message || "Server error");
    }
  };

  /* ================= EDIT ================= */
  const startEdit = (q) => {
    const [amt, unt] = q.name.split(" ");

    setEditingId(q.id);
    setEditBC(`${q.brand_id}-${q.category_id}`);
    setEditAmount(amt);
    setEditUnit(unt || "Qty");
  };

  const saveEdit = async (id) => {
    if (!editAmount || !editBC) return;

    const [brand_id, category_id] = editBC.split("-");

    await updateQuantity(id, {
      brand_id: Number(brand_id),
      category_id: Number(category_id),
      name: `${editAmount} ${editUnit}`,
    });

    setEditingId(null);
    loadData();
    toast.success("Quantity Updated sucessfully")
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditBC("");
    setEditAmount("");
    setEditUnit("Qty");
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (window.confirm("Delete this quantity?")) {
      await deleteQuantity(id);
      loadData();
      toast.error("Quantity has been deleted");

    }
  };

  return (
    <div className="row gy-4">
      {/* ================= FORM ================= */}
      <div className="col-lg-10">
        <form className="row gy-3" onSubmit={handleSubmit}>
          <div className="col-md-6">
            <select
              className="form-select"
              value={selectedBC}
              onChange={(e) => setSelectedBC(e.target.value)}
            >
              <option value="">Select Brand - Category</option>
              {brandCategories.map((bc) => (
                <option
                  key={`${bc.brand_id}-${bc.category_id}`}
                  value={`${bc.brand_id}-${bc.category_id}`}
                >
                  {bc.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <input
              type="number"
              min="1"
              className="form-control"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <select
              className="form-select"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-12">
            <button className="btn main-btn">Add Quantity</button>
            {error && <p className="text-danger mt-2">{error}</p>}
          </div>
        </form>
      </div>

      {/* ================= TABLE ================= */}
      <div className="col-lg-10">
        <table className="common-table table-striped">
          <thead>
            <tr>
              <th>Brand - Category</th>
              <th>Quantity</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {quantities.map((q) => (
              <tr key={q.id}>
                <td>
                  {editingId === q.id ? (
                    <select
                      className="form-select"
                      value={editBC}
                      onChange={(e) => setEditBC(e.target.value)}
                    >
                      {brandCategories.map((bc) => (
                        <option
                          key={`${bc.brand_id}-${bc.category_id}`}
                          value={`${bc.brand_id}-${bc.category_id}`}
                        >
                          {bc.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    `${q.brand_name} - ${q.category_name}`
                  )}
                </td>

                <td>
                  {editingId === q.id ? (
                    <div className="d-flex gap-2">
                      <input
                        type="number"
                        className="form-control"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                      />
                      <select
                        className="form-select"
                        value={editUnit}
                        onChange={(e) => setEditUnit(e.target.value)}
                      >
                        {UNITS.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    q.name
                  )}
                </td>

                <td className="d-flex justify-content-end">
                  {editingId === q.id ? (
                    <>
                      <button
                        type="button"
                        className="btn btn-success me-2"
                        onClick={() => saveEdit(q.id)}
                      >
                        ✔
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={cancelEdit}
                      >
                        ✖
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="btn btn-warning me-2"
                        onClick={() => startEdit(q)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => handleDelete(q.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

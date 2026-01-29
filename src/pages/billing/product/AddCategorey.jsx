import { useEffect, useState } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../../services/category.service";
import { getBrands } from "../../../services/brand.service";
import { toast } from "react-toastify";

export const AddCategorey = () => {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  // create states
  const [brand, setBrand] = useState("");
  const [categoryName, setCategoryName] = useState("");

  // edit states
  const [editingId, setEditingId] = useState(null);
  const [editBrand, setEditBrand] = useState("");
  const [editName, setEditName] = useState("");
  
  // validation
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const brandData = await getBrands();
    const categoryData = await getCategories();
    setBrands(brandData);
    setCategories(categoryData);
  };

  /* ================= CREATE CATEGORY ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!brand || !categoryName.trim()) {
      setError("Brand and Category name are required");
      return;
    }

    try {
      await createCategory({
        name: categoryName,
        brand_id: Number(brand),
      });

      setBrand("");
      setCategoryName("");
      setError("");
      loadData();
      toast.success("Category Added successfully ✅");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  /* ================= EDIT ================= */
  const startEdit = (cat) => {
  const brandObj = brands.find((b) => b.id === cat.brand_id);

  if (brandObj && brandObj.status === "inactive") {
    alert("This category belongs to an inactive brand");
    return;
  }

  setEditingId(cat.id);
  setEditBrand(cat.brand_id);
  setEditName(cat.name);
 };

  const saveEdit = async (id) => {
    if (!editBrand || !editName.trim()) return;

    await updateCategory(id, {
      name: editName,
      brand_id: Number(editBrand),
      
    });
    toast.success("Category Updated successfully ✅");

    setEditingId(null);
    loadData();
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (window.confirm("Delete this category?")) {
      await deleteCategory(id);
      loadData();
      toast.error("Category has been deleted");

    }
  };

  
  return (
    <>
      <div className="row gy-4">
        {/* ================= FORM ================= */}
        <div className="col-lg-10">
          <div className="form_element">
            <div className="form_title">
              <h5 className="title">Add Category</h5>
            </div>

            <div className="form_content">
              <form className="row gy-3" onSubmit={handleSubmit}>
                <div className="col-md-4">
                  <select
                    className={`form-select ${error ? "is-invalid" : ""}`}
                    value={brand}
                    onChange={(e) => {
                      setBrand(e.target.value);
                      if (error) setError("");
                    }}
                  >
                    <option value="">Select Brand</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <input
                    type="text"
                    className={`form-control ${error ? "is-invalid" : ""}`}
                    placeholder="Category Name"
                    value={categoryName}
                    onChange={(e) => {
                      setCategoryName(e.target.value);
                      if (error) setError("");
                    }}
                  />
                  {error && (
                    <div className="invalid-feedback d-block">{error}</div>
                  )}
                </div>

                <div className="col-md-3">
                  <button
                    className="btn main-btn"
                    disabled={!brand || !categoryName.trim()}
                  >
                    Add Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <div className="col-lg-10">
          <div className="common-table-wrapper">
            <table className="common-table table-striped">
              <thead>
                <tr>
                  <th>Brand Name</th>
                  <th>Category</th>
                  
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    {/* BRAND */}
                    <td>
                      {editingId === cat.id ? (
                        <select
                          className="form-select"
                          value={editBrand}
                          onChange={(e) => setEditBrand(e.target.value)}
                        >
                          {brands.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        cat.brand_name
                      )}
                    </td>

                    {/* CATEGORY */}
                    <td>
                      {editingId === cat.id ? (
                        <input
                          type="text"
                          className="form-control"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      ) : (
                        cat.name
                      )}
                    </td>
                   

                    {/* ACTIONS */}
                    <td className="action-buttons d-flex justify-content-end">
                      {editingId === cat.id ? (
                        <>
                          <button
                            className="btn btn-sm btn-success me-2"
                            onClick={() => saveEdit(cat.id)}
                          >
                            ✔
                          </button>
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={cancelEdit}
                          >
                            ✖
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn btn-sm btn-warning me-2"
                            onClick={() => startEdit(cat)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(cat.id)}
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
      </div>
    </>
  );
};

import { useEffect, useState } from "react";
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../../../services/brand.service";
import { toast } from "react-toastify";
export const AddBrand = () => {
  const [brands, setBrands] = useState([]);

  // create
  const [brandName, setBrandName] = useState("");

  // edit
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  
  // validation
  const [error, setError] = useState("");

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    const data = await getBrands();
    setBrands(data);
  };

  /* ================= CREATE BRAND ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!brandName.trim()) {
      setError("Brand name is required");
      return;
    }

    try {
      await createBrand({
        name: brandName.trim(),
        status: "active",
      });

      setBrandName("");
      setError("");
      loadBrands();
      toast.success("Brand Added successfully ✅");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  /* ================= EDIT ================= */
  const startEdit = (brand) => {
    setEditingId(brand.id);
    setEditName(brand.name);
  
  };

  const saveEdit = async (id) => {
    if (!editName.trim()) return;

    await updateBrand(id, {
      name: editName.trim(),
   
    });
    toast.success("Brand Updated successfully ✅");

    setEditingId(null);
    setEditName("");
    setEditStatus("active");
    loadBrands();
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditStatus("active");
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (window.confirm("Delete this brand?")) {
      await deleteBrand(id);
      loadBrands();
    toast.error("Brand has been deleted");

    }
  };

  return (
    <>
      <div className="row gy-4">
        {/* ================= FORM ================= */}
        <div className="col-lg-12">
          <div className="form_element">
            <div className="form_title">
              <h5 className="title">Add Brand</h5>
            </div>

            <div className="form_content">
              <form className="row gy-3" onSubmit={handleSubmit}>
                <div className="col-md-9">
                  <input
                    type="text"
                    className={`form-control ${error ? "is-invalid" : ""}`}
                    placeholder="Brand Name"
                    value={brandName}
                    onChange={(e) => {
                      setBrandName(e.target.value);
                      if (error) setError("");
                    }}
                  />
                  {error && (
                    <div className="invalid-feedback d-block">{error}</div>
                  )}
                </div>

                <div className="col-md-3 text-lg-end">
                  <button
                    className="btn main-btn"
                    disabled={!brandName.trim()}
                  >
                    Add Brand
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* ================= TABLE ================= */}
        <div className="col-lg-12">
          <div className="common-table-wrapper">
            <table className="common-table table-striped">
              <thead>
                <tr>
                  <th>Brand Name</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {brands.map((brand) => (
                  <tr key={brand.id}>
                    {/* BRAND NAME */}
                    <td>
                      {editingId === brand.id ? (
                        <input
                          type="text"
                          className="form-control"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                        />
                      ) : (
                        brand.name
                      )}
                    </td>

                    {/* STATUS */}
                    

                    {/* ACTIONS */}
                    <td className="action-buttons d-flex justify-content-end">
                      {editingId === brand.id ? (
                        <>
                          <button
                            className="btn btn-sm btn-success me-2"
                            onClick={() => saveEdit(brand.id)}
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
                            onClick={() => startEdit(brand)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>

                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(brand.id)}
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

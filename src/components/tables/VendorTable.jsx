import React, { useEffect, useState } from "react";
import { getVendors, deleteVendor } from "../../services/vendor.service";
import { toast } from "react-toastify";

export const VendorTable = ({ search = "", onEdit }) => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */
  const fetchVendors = async () => {
    setLoading(true);
    try {
      const data = await getVendors();
      setVendors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch vendors", error);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  /* ================= SEARCH ================= */
  const filteredVendors = vendors.filter((v) => {
    if (!search) return true;
    const k = search.toLowerCase();

    return (
      `${v.first_name} ${v.last_name}`.toLowerCase().includes(k) ||
      v.phone?.toLowerCase().includes(k) ||
      v.email?.toLowerCase().includes(k) ||
      v.bank_name?.toLowerCase().includes(k) ||
      v.bank_branch_name?.toLowerCase().includes(k)
    );
  });

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this vendor?")) return;

    try {
      await deleteVendor(id);
      toast.success("Vendor deleted successfully");
      fetchVendors();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete vendor");
    }
  };

  if (loading) return <p>Loading vendors...</p>;

  return (
    <div className="common-table-wrapper mt-4">
      <table className="common-table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Vendor Name</th>
            <th>Email</th>
            <th>Phone</th>

            {/* ✅ BANK DETAILS */}
            <th>Bank Name</th>
            <th>Branch</th>

            {/* TEMP / FUTURE */}
            <th>Product</th>
            <th>Buy Stock</th>

            <th className="text-end">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredVendors.length === 0 ? (
            <tr>
              <td colSpan="9" className="text-center">
                No vendors found
              </td>
            </tr>
          ) : (
            filteredVendors.map((v) => (
              <tr key={v.id}>
                <td>{v.id}</td>

                <td>
                  {v.first_name} {v.last_name}
                </td>

                <td>{v.email || "—"}</td>
                <td>{v.phone}</td>

                {/* ✅ BANK DATA */}
                <td>{v.bank_name || "—"}</td>
                <td>{v.bank_branch_name || "—"}</td>

                {/* PLACEHOLDERS */}
                <td className="text-muted">—</td>
                <td className="text-muted">0</td>

                <td className="text-end">
                  {/* EDIT */}
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => onEdit(v)}
                    title="Edit Vendor"
                  >
                    <i className="bi bi-pencil"></i>
                  </button>

                  {/* DELETE */}
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(v.id)}
                    title="Delete Vendor"
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
  );
};

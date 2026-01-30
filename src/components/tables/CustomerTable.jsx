import React, { useEffect, useState } from "react";
import {
  getCustomers,
  deleteCustomer,
} from "../../services/customer.service";
import { AddCustomers } from "../../pages/billing/customers/AddCustomers";
import { toast } from "react-toastify";

export const CustomerTable = ({ search, showActions = true }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);

  /* ================= FETCH CUSTOMERS ================= */
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch customers", error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  /* ================= SEARCH FILTER ================= */
  const filteredCustomers = customers.filter((c) => {
    if (!search) return true;

    const keyword = search.toLowerCase();

    return (
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(keyword) ||
      c.phone?.toLowerCase().includes(keyword) ||
      c.email?.toLowerCase().includes(keyword)
    );
  });

  /* ================= EDIT ================= */
  const handleEdit = (customer) => {
    setEditData(customer);
    setShowModal(true);
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this customer?")) return;

    try {
      await deleteCustomer(id);
      toast.success("Customer deleted successfully");
      fetchCustomers();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete customer");
    }
  };

  /* ================= CLOSE MODAL ================= */
  const handleCloseModal = () => {
    setShowModal(false);
    setEditData(null);
  };
  const handleRefresh = (newCustomer) => {
  if (newCustomer) {
    // ⚡ INSTANT UI UPDATE
    setCustomers(prev => [newCustomer, ...prev]);
  } else {
    fetchCustomers();
  }
};

  {loading && (
  <div className="text-center my-2">
    <span className="spinner-border spinner-border-sm me-2" />
    Refreshing customers...
  </div>
)}


  return (
    <>
      <div className="common-table-wrapper mt-4">
        <table className="common-table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Total Billing</th>
              <th>Pending</th>

              {/* ✅ ACTION HEADER (CONDITIONAL) */}
              {showActions && <th className="text-end">Actions</th>}
            </tr>
          </thead>

          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td
                  colSpan={showActions ? 8 : 7}
                  className="text-center"
                >
                  No customers found
                </td>
              </tr>
            ) : (
              filteredCustomers.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>

                  <td>
                    {c.first_name} {c.last_name}
                  </td>

                  <td>{c.email || "—"}</td>

                  <td>{c.phone}</td>

                  <td>{c.address || "—"}</td>

                  {/* ✅ TOTAL BILLING */}
                  <td>
                    ₹ {Number(c.total || 0).toLocaleString()}
                  </td>

                  {/* ✅ TOTAL PENDING */}
                  <td
                    className={
                      Number(c.pending_amount) > 0
                        ? "text-danger fw-bold"
                        : "text-success fw-bold"
                    }
                  >
                    ₹ {Number(c.pending_amount || 0).toLocaleString()}
                  </td>

                  {/* ✅ ACTION BUTTONS (CONDITIONAL) */}
                  {showActions && (
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEdit(c)}
                      >
                        <i className="bi bi-pencil" />
                      </button>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(c.id)}
                      >
                        <i className="bi bi-trash" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            {/* MODAL HEADER */}
            <div className="modal-header customer-modal-header">
              <h5 className="modal-title">
                {editData ? "Edit Customer" : "Add Customer"}
              </h5>

              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseModal}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="modal-body">
              <AddCustomers
                editData={editData}
                closeModal={handleCloseModal}
                refresh={handleRefresh}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

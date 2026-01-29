import { useState } from "react";
import { VendorTable } from "../../../components/tables/VendorTable";
import { AddVendors } from "./AddVendors";
import "./vendor.model.css";

export const VendorList = () => {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [editData, setEditData] = useState(null);

  const handleEdit = (vendor) => {
    setEditData(vendor);
    setShowModal(true);
  };

  return (
    <>
      <div className="product_detail">
        <div className="mb-4">
          <div className="row gy-3 align-items-center">
            <div className="col-lg-12">
              <div className="d-flex justify-content-end gap-3 align-items-center">

                {/* SEARCH */}
                <div className="search-box">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search by name, phone, email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <i className="bi bi-search search-icon"></i>
                </div>

                {/* ADD */}
                <button
                  className="btn main-btn"
                  onClick={() => {
                    setEditData(null);
                    setShowModal(true);
                  }}
                >
                  Add Vendors +
                </button>

              </div>
            </div>
          </div>
        </div>

        <VendorTable search={search} onEdit={handleEdit} />
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <div className="modal-header customer-modal-header">
              <h5>{editData ? "Edit Vendor" : "Add Vendor"}</h5>
              <button
                className="modal-close-btn"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <AddVendors
                editData={editData}
                closeModal={() => setShowModal(false)}
                refresh={() => setShowModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

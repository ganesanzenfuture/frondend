import { useState } from "react";
import { CustomerTable } from "../../../components/tables/CustomerTable";
import { AddCustomers } from "./AddCustomers";
import "./customer.model.css";

export const CustomerList = () => {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState(""); // ✅ search state

  return (
    <>
      <div className="product_detail">
        <div className="mb-4">
          <div className="row gy-3 align-items-center">
            <div className="col-lg-12">
              <div className="d-flex justify-content-end gap-3 align-items-center">

                {/* ✅ SEARCH */}
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

                <div className="add-btn">
                  <button
                    className="btn main-btn"
                    onClick={() => setShowModal(true)}
                  >
                    Add Customers +
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* ✅ PASS SEARCH TO TABLE */}
        <CustomerTable search={search} />
      </div>

      {showModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <div className="modal-header customer-modal-header">
              <h5>Add Customer</h5>
              <button
                className="modal-close-btn"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <AddCustomers closeModal={() => setShowModal(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

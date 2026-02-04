import { useState } from "react";
import { CustomerTable } from "../../../components/tables/CustomerTable";
import { AddCustomers } from "./AddCustomers";
import "./customer.model.css";

export const CustomerList = () => {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState([]); // ✅ LIFT STATE UP

  // ✅ INSTANT UPDATE HANDLER
  const handleRefresh = (customer) => {
    setCustomers((prev) => {
      const exists = prev.find(c => (c.id || c._id) === customer.id);
      if (exists) {
        return prev.map(c =>
          (c.id || c._id) === customer.id ? customer : c
        );
      }
      return [customer, ...prev];
    });
  };

  return (
    <>
      <div className="product_detail">
        <div className="mb-4">
          <div className="row gy-3 align-items-center">
            <div className="col-lg-12">
              <div className="d-flex justify-content-end gap-3 align-items-center flex-wrap">

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

        {/* ✅ PASS STATE + SEARCH */}
        <CustomerTable
          search={search}
          customers={customers}
          setCustomers={setCustomers}
        />
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
              <AddCustomers
                closeModal={() => setShowModal(false)}
                refresh={handleRefresh} // 🔥 THIS FIXES IT
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
// import { useEffect, useState } from "react";
// import { CustomerTable } from "../../../components/tables/CustomerTable";
// import { AddCustomers } from "./AddCustomers";
// import { getCustomers } from "../../../services/customer.service";
// import "./customer.model.css";

// export const CustomerList = () => {
//   const [showModal, setShowModal] = useState(false);
//   const [search, setSearch] = useState("");
//   const [customers, setCustomers] = useState([]);
//   const [editData, setEditData] = useState(null);

//   // ✅ FETCH ONCE
//   useEffect(() => {
//     fetchCustomers();
//   }, []);

//   const fetchCustomers = async () => {
//     const data = await getCustomers();
//     setCustomers(Array.isArray(data) ? data : []);
//   };

//   // ✅ INSTANT ADD / EDIT UPDATE
//   const handleRefresh = (customer) => {
//     setCustomers(prev => {
//       const exists = prev.find(c => (c.id || c._id) === customer.id);
//       if (exists) {
//         return prev.map(c =>
//           (c.id || c._id) === customer.id ? customer : c
//         );
//       }
//       return [customer, ...prev];
//     });
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setEditData(null);
//   };

//   return (
//     <>
//       <div className="product_detail">
//         <div className="mb-4">
//           <div className="row gy-3 align-items-center">
//             <div className="col-lg-12">
//               <div className="d-flex justify-content-end gap-3 align-items-center flex-wrap">

//                 {/* SEARCH */}
//                 <div className="search-box">
//                   <input
//                     type="text"
//                     className="search-input"
//                     placeholder="Search by name, phone, email..."
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                   />
//                   <i className="bi bi-search search-icon" />
//                 </div>

//                 <button
//                   className="btn main-btn"
//                   onClick={() => setShowModal(true)}
//                 >
//                   Add Customers +
//                 </button>

//               </div>
//             </div>
//           </div>
//         </div>

//         <CustomerTable
//           search={search}
//           customers={customers}
//           setEditData={setEditData}
//           openModal={() => setShowModal(true)}
//         />
//       </div>

//       {/* ✅ SINGLE MODAL SOURCE */}
//       {showModal && (
//         <div className="custom-modal-overlay">
//           <div className="custom-modal">
//             <div className="modal-header customer-modal-header">
//               <h5>{editData ? "Edit Customer" : "Add Customer"}</h5>
//               <button className="modal-close-btn" onClick={handleCloseModal}>
//                 ✕
//               </button>
//             </div>

//             <div className="modal-body">
//               <AddCustomers
//                 editData={editData}
//                 closeModal={handleCloseModal}
//                 refresh={handleRefresh}
//               />
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

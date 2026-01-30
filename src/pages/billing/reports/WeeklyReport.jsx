import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getProductWiseReport } from "../../../services/customerBilling.service";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export const ProductSalesReport = () => {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  /* ================= FETCH ================= */
  const fetchProductSales = async () => {
    try {
      setLoading(true);
      const data = await getProductWiseReport();
      setRows(data);
      setFilteredRows(data);
    } catch (error) {
      toast.error("Failed to load product sales report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductSales();
  }, []);

  /* ================= SEARCH ================= */
  useEffect(() => {
    const value = search.toLowerCase();
    setFilteredRows(
      rows.filter((item) =>
        Object.values(item).some(
          (val) => val && val.toString().toLowerCase().includes(value)
        )
      )
    );
  }, [search, rows]);

  /* ================= EXCEL EXPORT ================= */
  const exportExcel = () => {
    const excelData = filteredRows.map((item) => ({
      Product: item.product_name,
      Brand: item.product_brand,
      Category: item.product_category,
      Unit: item.product_quantity,
      "Total Sold": item.total_quantity_sold,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Product Sales");

    const buffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([buffer], { type: "application/octet-stream" }),
      "Product_Sales_Report.xlsx"
    );
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-12">

        {/* SEARCH + ACTIONS */}
        <div className="d-md-flex align-items-center justify-content-between mb-3">
          <div className="search-box">
            <input
              type="text"
              className="search-input"
              placeholder="Search product / brand / category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <i className="bi bi-search search-icon"></i>
          </div>

          <div className="d-flex gap-2">
            <button className="excel-btn" onClick={exportExcel}>
              <i className="fi fi-tr-file-excel"></i>Export Excel
            </button>
{/* 
            <button className="print-btn" onClick={() => window.print()}>
              <i className="fi fi-tr-print"></i> Print
            </button> */}
          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="text-center py-5">
            Loading product sales report...
          </div>
        ) : (
          <div className="common-table-wrapper">
            <table className="common-table table-striped">
              <thead>
                <tr>
                  <th className="text-start">Product</th>
                  <th className="text-center">
                    Details (Brand | Category | Unit)
                  </th>
                  <th className="text-end">Total Sold Count</th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.length ? (
                  filteredRows.map((item, i) => (
                    <tr key={i}>
                      {/* PRODUCT */}
                      <td className="text-start">
                        {item.product_name}
                      </td>

                      {/* DETAILS */}
                      <td className="text-center">
                        {item.product_brand} •{" "}
                        {item.product_category} •{" "}
                        {item.product_quantity}
                      </td>

                      {/* SOLD COUNT */}
                      <td className="text-end">
                        <span style={{ fontSize: "14px" }}>
                          {item.total_quantity_sold}
                        </span>{" "}
                        <span
                          style={{
                            fontSize: "12px",
                            color: "#888",
                          }}
                        >
                          Pack
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center">
                      No product sales found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

import React, { useEffect, useState } from "react";
import { getProducts, deleteProduct } from "../../services/product.service";
import { toast } from "react-toastify";

export const ProductTable = ({
  refreshKey,
  onEdit,
  search,
  brand,
  category,
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

 const fetchProducts = async () => {
  try {
    const data = await getProducts();

    const normalized = data.map((p) => ({
      ...p,
      brand: p.brand ?? p.brand_name ?? "-",
      category: p.category ?? p.category_name ?? "-",
      quantity: p.quantity ?? p.quantity_name ?? "-",
    }));

    setProducts(normalized);
  } catch (error) {
    toast.error("Failed to load products");
  } finally {
    setLoading(false);
  }
};



  useEffect(() => {
    fetchProducts();
  }, [refreshKey]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await deleteProduct(id);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch {
      toast.error("Delete failed");
    }
  };

  /* ================= FILTER LOGIC ================= */
  const filteredProducts = products.filter((p) => {
  const searchText = search.toLowerCase();

  const matchesSearch =
    p.product_name?.toLowerCase().includes(searchText) ||
    p.product_code?.toLowerCase().includes(searchText) ||
    p.brand.toLowerCase().includes(searchText) ||
    p.category.toLowerCase().includes(searchText) ||
    p.quantity.toLowerCase().includes(searchText);

  const matchesBrand = brand ? p.brand === brand : true;
  const matchesCategory = category ? p.category === category : true;

  return matchesSearch && matchesBrand && matchesCategory;
});


  if (loading) return <p>Loading products...</p>;

  return (
    <div className="common-table-wrapper">
      <table className="common-table table-striped">
        <thead>
          <tr>
            <th>Product Code</th>
            <th>Product Name</th>
            <th>Brand</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Price</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredProducts.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">
                No products found
              </td>
            </tr>
          ) : (
            filteredProducts.map((p) => {
              const brandValue = p.brand ?? p.brand_name ?? "-";
              const categoryValue = p.category ?? p.category_name ?? "-";
              const quantityValue = p.quantity ?? p.quantity_name ?? "-";

              return (
                <tr key={p.id}>
                  <td>{p.product_code}</td>
                  <td>{p.product_name}</td>
                  <td>{brandValue}</td>
                  <td>{categoryValue}</td>
                  <td>{quantityValue}</td>
                  <td>{Number(p.price).toFixed(2)}</td>

                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => onEdit(p)}
                      title="Edit"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>

                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(p.id)}
                      title="Delete"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

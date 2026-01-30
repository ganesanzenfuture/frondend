import React, { useState, useEffect } from "react";
import { registerUser, getUsers, deleteUser, updateUser } from "../../services/user.service";
import { toast } from "react-toastify";
import { Pencil, Trash2 } from "lucide-react";

const UsersPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  // FETCH USERS
  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch {
      toast.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // OPEN ADD
  const openAddModal = () => {
    setIsEdit(false);
    setEditId(null);
    setFormData({ username: "", email: "", password: "" });
    setShowModal(true);
  };

  // OPEN EDIT
  const openEditModal = (user) => {
    setIsEdit(true);
    setEditId(user.id);
    setFormData({
      username: user.username,
      email: user.email || "",
      password: "",
    });
    setShowModal(true);
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await updateUser(editId, formData);
        toast.success("User updated");
      } else {
        await registerUser(formData);
        toast.success("User created");
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error");
    }
  };

  // DELETE
 const handleDelete = async (id) => {
  if (!window.confirm("Delete this user?")) return;

  try {
    await deleteUser(id);
    toast.success("User deleted");
    fetchUsers();
  } catch (err) {
    console.log(err);

    const message =
      err?.response?.data?.message || "Delete failed";

    toast.error(message);
  }
};

  return (
    <div className="container mt-1">
      <div className="d-flex justify-content-between mb-3">
        <h4>Users</h4>
        <button className="btn main-btn" onClick={openAddModal}>
          + Add User
        </button>
      </div>

      <table className="common-table table-striped">
        <thead>
          <tr>
            <th>#</th>
            <th>Username</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center">No users</td>
            </tr>
          ) : (
            users.map((u, i) => (
              <tr key={u.id}>
                <td>{i + 1}</td>
                <td>{u.username}</td>
                <td>{u.email || "-"}</td>
                <td className="d-flex gap-3">
                  <Pencil
                    size={18}
                    className="icon-btn edit-icon"
                    onClick={() => openEditModal(u)}
                  />
                  <Trash2
                    size={18}
                    className="icon-btn delete-icon"
                    onClick={() => handleDelete(u.id)}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showModal && (
        <div className="modal fade show d-block mt-5">
          <div className="modal-dialog">
            <div className="modal-content">

              <div className="modal-header">
                <h5>{isEdit ? "Edit User" : "Create User"}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>

              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label>Username</label>
                    <input
                      name="username"
                      className="form-control"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label>Email</label>
                    <input
                      name="email"
                      className="form-control"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label>Password {isEdit && "(leave blank to keep same)"}</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control"
                      value={formData.password}
                      onChange={handleChange}
                      required={!isEdit}
                    />
                  </div>

                  <button type="submit" className="btn main-btn w-100">
                    {isEdit ? "Update User" : "Create User"}
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}

      {showModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
};

export default UsersPage;
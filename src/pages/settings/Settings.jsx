import { NavLink, Outlet } from "react-router-dom";
import "./settings.css";

export const Settings = () => {
  return (
    <div className="settings-container">
      <h3>Settings</h3>

      {/* Tabs */}
      <div className="settings-tabs mt-4">
        <NavLink to="edit-profile" className={({ isActive }) => (isActive ? "active" : "")}>
          Profile
        </NavLink>

        <NavLink to="bank-details" className={({ isActive }) => (isActive ? "active" : "")}>
          Bank Details
        </NavLink>
        <NavLink to="create-profile" className={({ isActive }) => (isActive ? "active" : "")}>
          create profile
        </NavLink>
        <NavLink to="company-details" className={({ isActive }) => (isActive ? "active" : "")}>
          company details
        </NavLink>
      </div>

      {/* Tab Content */}
      <div className="settings-content">
        <Outlet />
      </div>
    </div>
  );
};

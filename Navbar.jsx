import React from "react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    `nav-link px-3 ${isActive ? "active fw-semibold" : ""}`;

  return (
    <nav className="navbar navbar-expand navbar-dark app-navbar">
      <div className="container">
        <NavLink className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/">
          <span className="brand-mark" aria-hidden="true">EP</span>
          <span>Employee Portal</span>
        </NavLink>
        <div className="navbar-nav ms-auto flex-row align-items-center">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/employee-form" className={linkClass}>Employee Form</NavLink>
        </div>
      </div>
    </nav>
  );
}
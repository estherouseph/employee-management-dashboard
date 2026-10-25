import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { getEmployees, deleteEmployee } from "../api.js";

export default function Home() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  async function loadEmployees() {
    try {
      setLoading(true);
      setError("");
      setActionError("");
      const response = await getEmployees();
      setEmployees(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Could not load employees. Make sure the backend API is running.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  async function handleDelete(employee) {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${employee.name}"?`
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(employee._id);
      setActionError("");
      await deleteEmployee(employee._id);
      setEmployees((prev) => prev.filter((item) => item._id !== employee._id));
      setSuccessMessage(`Employee "${employee.name}" was deleted successfully.`);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to delete employee.";
      setActionError(msg);
    } finally {
      setDeletingId(null);
    }
  }

  function getInitials(name) {
    if (!name) return "EP";
    const parts = name.trim().split(/\s+/);
    return parts.slice(0, 2).map((part) => part[0].toUpperCase()).join("");
  }

  function formatSalary(amount) {
    const num = Number(amount);
    if (Number.isNaN(num)) return "₹0";
    return `₹${num.toLocaleString("en-IN")}`;
  }

  const filteredEmployees = employees.filter((employee) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    const nameMatch = (employee.name || "").toLowerCase().includes(query);
    const emailMatch = (employee.email || "").toLowerCase().includes(query);
    const desigMatch = (employee.designation || "").toLowerCase().includes(query);
    const locMatch = (employee.location || "").toLowerCase().includes(query);
    const idMatch = String(employee._id || employee.id || "").toLowerCase().includes(query);
    return nameMatch || emailMatch || desigMatch || locMatch || idMatch;
  });

  return (
    <section>
      <div className="hero-panel mb-4 mb-md-5">
        <div>
          <div className="eyebrow">PEOPLE &amp; DIRECTORY</div>
          <h1 className="display-6 fw-bold mt-2 mb-2">Employee Dashboard</h1>
          <p className="text-secondary mb-0">Manage, view, and update your team directory.</p>
        </div>
        <div className="hero-icon" aria-hidden="true">👥</div>
      </div>

      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show d-flex justify-content-between align-items-center mb-4" role="alert">
          <span>{successMessage}</span>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setSuccessMessage("")}
          />
        </div>
      )}

      {actionError && (
        <div className="alert alert-danger alert-dismissible fade show d-flex justify-content-between align-items-center mb-4" role="alert">
          <span>{actionError}</span>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setActionError("")}
          />
        </div>
      )}

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3 mb-3">
        <div>
          <h2 className="h4 fw-bold mb-1">Employee Directory</h2>
          <p className="text-secondary small mb-0">Connected to Employee Management API.</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <div className="search-wrap">
            <label className="visually-hidden" htmlFor="employee-search">Search employees</label>
            <input
              id="employee-search"
              className="form-control"
              type="search"
              placeholder="Search name, email, role..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <Link to="/employee-form" className="btn btn-primary text-nowrap d-inline-flex align-items-center gap-1">
            <span aria-hidden="true">＋</span> Add Employee
          </Link>
        </div>
      </div>

      {loading && (
        <div className="state-card text-center py-5" role="status">
          <div className="spinner-border text-primary mb-3" aria-hidden="true" />
          <p className="text-secondary mb-0">Loading employee directory…</p>
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-danger d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
          <div>
            <strong>Connection error:</strong> {error}
          </div>
          <button className="btn btn-outline-danger btn-sm text-nowrap" onClick={loadEmployees}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="directory-card">
          <div className="directory-toolbar d-flex justify-content-between align-items-center px-3 px-md-4 py-3">
            <span className="fw-semibold">All employees</span>
            <span className="count-pill">
              {filteredEmployees.length} {filteredEmployees.length === 1 ? "record" : "records"}
            </span>
          </div>

          <div className="table-responsive">
            <table className="table employee-table align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">NAME</th>
                  <th scope="col">EMAIL</th>
                  <th scope="col">DESIGNATION</th>
                  <th scope="col">LOCATION</th>
                  <th scope="col">SALARY</th>
                  <th scope="col" className="text-end">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee, index) => {
                  const empId = employee._id || employee.id;
                  const displayId = employee._id
                    ? employee._id.slice(-6).toUpperCase()
                    : String(index + 1).padStart(2, "0");
                  return (
                    <tr key={empId}>
                      <td>
                        <span className="id-chip" title={String(empId)}>
                          {displayId}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <span className="avatar" aria-hidden="true">
                            {getInitials(employee.name)}
                          </span>
                          <span className="fw-semibold">{employee.name}</span>
                        </div>
                      </td>
                      <td>
                        {employee.email ? (
                          <a className="email-link" href={`mailto:${employee.email}`}>
                            {employee.email}
                          </a>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td>{employee.designation || <span className="text-muted">—</span>}</td>
                      <td>{employee.location || <span className="text-muted">—</span>}</td>
                      <td className="fw-medium">{formatSalary(employee.salary)}</td>
                      <td className="text-end">
                        <div className="d-inline-flex gap-2">
                          <Link
                            to={`/employee-form/${empId}`}
                            state={{ employee }}
                            className="btn btn-sm btn-outline-primary"
                            title="Edit employee"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(employee)}
                            className="btn btn-sm btn-outline-danger"
                            disabled={deletingId === empId}
                            title="Delete employee"
                          >
                            {deletingId === empId ? (
                              <span className="spinner-border spinner-border-sm" aria-hidden="true" />
                            ) : (
                              "Delete"
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {employees.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="py-4">
                        <div className="display-6 mb-2" aria-hidden="true">📁</div>
                        <h3 className="h5 fw-bold text-dark mb-1">No employees found</h3>
                        <p className="text-secondary small mb-3">
                          Your employee database is currently empty. Get started by adding a team member.
                        </p>
                        <Link to="/employee-form" className="btn btn-primary btn-sm">
                          ＋ Add New Employee
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}

                {employees.length > 0 && filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="py-3">
                        <p className="text-secondary mb-2">No employees match &ldquo;{search}&rdquo;.</p>
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => setSearch("")}
                        >
                          Clear search
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="directory-footer px-3 px-md-4 py-3 small text-secondary d-flex justify-content-between align-items-center">
            <span>Employee Management System</span>
            <span>Total: {employees.length}</span>
          </div>
        </div>
      )}
    </section>
  );
}

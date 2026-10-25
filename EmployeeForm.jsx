import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { getEmployeeById, createEmployee, updateEmployee } from "../api.js";

const initialForm = {
  name: "",
  email: "",
  designation: "",
  location: "",
  salary: ""
};

export default function EmployeeForm() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!id) {
      setFormData(initialForm);
      setSuccessMessage("");
      setErrorMessage("");
      return;
    }

    if (location.state?.employee) {
      const emp = location.state.employee;
      setFormData({
        name: emp.name || "",
        email: emp.email || "",
        designation: emp.designation || "",
        location: emp.location || "",
        salary: emp.salary ?? ""
      });
      return;
    }

    async function fetchEmployee() {
      try {
        setLoading(true);
        setErrorMessage("");
        const response = await getEmployeeById(id);
        const emp = response.data;
        if (!emp) {
          setErrorMessage("Employee not found.");
          return;
        }
        setFormData({
          name: emp.name || "",
          email: emp.email || "",
          designation: emp.designation || "",
          location: emp.location || "",
          salary: emp.salary ?? ""
        });
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Failed to load employee details.";
        setErrorMessage(msg);
      } finally {
        setLoading(false);
      }
    }

    fetchEmployee();
  }, [id, location.state]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setErrorMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.name.trim()) {
      setErrorMessage("Full name is required.");
      return;
    }

    const numericSalary = Number(formData.salary);
    if (!Number.isFinite(numericSalary) || numericSalary < 0) {
      setErrorMessage("Salary must be a non-negative number.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        designation: formData.designation.trim(),
        location: formData.location.trim(),
        salary: numericSalary
      };

      if (isEditMode) {
        await updateEmployee(id, payload);
        const msg = `Employee "${payload.name}" updated successfully!`;
        setSuccessMessage(msg);
      } else {
        await createEmployee(payload);
        const msg = `Employee "${payload.name}" added successfully!`;
        setSuccessMessage(msg);
        setFormData(initialForm);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "An error occurred while saving employee data.";
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  }

  function handleClear() {
    setFormData(initialForm);
    setErrorMessage("");
    setSuccessMessage("");
  }

  if (loading) {
    return (
      <section className="form-page">
        <div className="state-card text-center py-5" role="status">
          <div className="spinner-border text-primary mb-3" aria-hidden="true" />
          <p className="text-secondary mb-0">Loading employee details…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="form-page">
      <div className="mb-4">
        <div className="eyebrow">EMPLOYEE MANAGEMENT</div>
        <h1 className="display-6 fw-bold mt-2 mb-2">
          {isEditMode ? "Edit Employee" : "Employee Form"}
        </h1>
        <p className="text-secondary mb-0">
          {isEditMode
            ? "Update employee information and save changes."
            : "Fill in the details below to add a new team member."}
        </p>
      </div>

      {successMessage && (
        <div className="alert alert-success d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4" role="status">
          <span>{successMessage}</span>
          <div className="d-flex gap-2">
            <Link to="/" className="btn btn-sm btn-success text-nowrap">
              View in Directory →
            </Link>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-danger alert-dismissible fade show d-flex justify-content-between align-items-center mb-4" role="alert">
          <span>{errorMessage}</span>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setErrorMessage("")}
          />
        </div>
      )}

      <div className="form-card">
        <div className="form-card-heading">
          <span className="form-heading-icon" aria-hidden="true">
            {isEditMode ? "✎" : "＋"}
          </span>
          <div>
            <h2 className="h5 fw-bold mb-1">
              {isEditMode ? "Update information" : "Employee information"}
            </h2>
            <p className="small text-secondary mb-0">
              Fields marked with an asterisk are required.
            </p>
          </div>
        </div>

        <form className="p-4 p-md-5" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="form-label">
              Full name <span className="text-danger">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-control form-control-lg"
              placeholder="e.g. Alex Morgan"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control form-control-lg"
              placeholder="e.g. alex@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="designation" className="form-label">
              Designation <span className="text-danger">*</span>
            </label>
            <input
              id="designation"
              name="designation"
              type="text"
              className="form-control form-control-lg"
              placeholder="e.g. Software Engineer"
              value={formData.designation}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="location" className="form-label">
              Location <span className="text-danger">*</span>
            </label>
            <input
              id="location"
              name="location"
              type="text"
              className="form-control form-control-lg"
              placeholder="e.g. Kochi, Kerala"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="salary" className="form-label">
              Salary <span className="text-danger">*</span>
            </label>
            <div className="input-group input-group-lg">
              <span className="input-group-text">₹</span>
              <input
                id="salary"
                name="salary"
                type="number"
                min="0"
                step="0.01"
                className="form-control"
                placeholder="e.g. 45000"
                value={formData.salary}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-note small mb-4">
            Data is persisted directly to the MongoDB backend via Express REST API.
          </div>

          <div className="d-flex flex-column flex-sm-row gap-2">
            <button
              type="submit"
              className="btn btn-primary btn-lg px-4"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
                  {isEditMode ? "Updating..." : "Saving..."}
                </>
              ) : (
                <>
                  {isEditMode ? "Update employee" : "Save employee"}{" "}
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>

            {!isEditMode && (
              <button
                type="button"
                className="btn btn-light btn-lg px-4"
                onClick={handleClear}
                disabled={submitting}
              >
                Clear form
              </button>
            )}

            <Link to="/" className="btn btn-outline-secondary btn-lg px-4 text-center">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}

import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import EmployeeForm from "./pages/EmployeeForm.jsx";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container page-container py-4 py-md-5">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/employee-form" element={<EmployeeForm />} />
          <Route path="/employee-form/:id" element={<EmployeeForm />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="app-footer text-center py-4">
        Employee Portal <span aria-hidden="true">·</span> React Demo
      </footer>
    </>
  );
}
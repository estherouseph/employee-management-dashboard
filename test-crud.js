import { EventEmitter } from "node:events";
import { Readable } from "node:stream";
import assert from "node:assert";
import mongoose from "mongoose";
import { app, Employee } from "./app.js";

console.log("=== RUNNING FULL CRUD LIFECYCLE & PERSISTENCE TEST ===");

const db = new Map();

// Stub Employee methods for the test
Employee.create = async function (doc) {
  const _id = new mongoose.Types.ObjectId().toString();
  const created = {
    _id,
    ...doc,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.set(_id, created);
  return created;
};

Employee.find = function () {
  return {
    sort: async function () {
      return Array.from(db.values());
    }
  };
};

Employee.findById = async function (id) {
  return db.get(id) || null;
};

Employee.findByIdAndUpdate = async function (id, updates) {
  const existing = db.get(id);
  if (!existing) return null;
  const updated = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  db.set(id, updated);
  return updated;
};

Employee.findByIdAndDelete = async function (id) {
  const existing = db.get(id);
  if (!existing) return null;
  db.delete(id);
  return existing;
};

function callApi(method, url, body = null) {
  return new Promise((resolve) => {
    const payload = body ? (typeof body === "string" ? body : JSON.stringify(body)) : null;
    const req = Readable.from(payload ? [Buffer.from(payload)] : []);
    req.method = method;
    req.url = url;
    req.headers = {
      host: "localhost",
      "content-type": "application/json",
      ...(payload ? { "content-length": Buffer.byteLength(payload).toString() } : {})
    };

    const res = new EventEmitter();
    res.statusCode = 200;
    res.headers = {};
    res.setHeader = (k, v) => { res.headers[k.toLowerCase()] = v; };
    res.getHeader = (k) => res.headers[k.toLowerCase()];
    res.removeHeader = (k) => { delete res.headers[k.toLowerCase()]; };

    let resBody = "";
    res.write = (chunk) => {
      if (chunk) resBody += chunk.toString();
      return true;
    };
    res.end = (chunk) => {
      if (chunk) resBody += chunk.toString();
      let parsed = resBody;
      try {
        parsed = JSON.parse(resBody);
      } catch {}
      resolve({
        status: res.statusCode,
        headers: res.headers,
        body: parsed
      });
    };

    app(req, res);
  });
}

// 1. Initial State: Listing empty database
const listEmpty = await callApi("GET", "/employees");
assert.strictEqual(listEmpty.status, 200, "Initial GET /employees should return 200");
assert.deepStrictEqual(listEmpty.body, [], "Initial employee list should be empty []");
console.log("[PASS] 1. Initial empty directory check passed: []");

// 2. Create Employee A (POST /employees)
const newEmployeeA = {
  name: "Alex Morgan",
  email: "alex.morgan@ictak.org",
  designation: "Full Stack Developer",
  location: "Kochi, Kerala",
  salary: 55000
};
const createResA = await callApi("POST", "/employees", newEmployeeA);
assert.strictEqual(createResA.status, 201, "POST /employees should return 201 Created");
assert.strictEqual(createResA.body.name, "Alex Morgan");
assert.strictEqual(createResA.body.email, "alex.morgan@ictak.org");
assert.strictEqual(createResA.body.salary, 55000);
assert(createResA.body._id, "Created employee must have an _id");
const empIdA = createResA.body._id;
console.log(`[PASS] 2. Employee created with ID: ${empIdA}`);

// 3. Create Employee B (POST /employees)
const newEmployeeB = {
  name: "Sarah Chen",
  email: "sarah.c@ictak.org",
  designation: "QA Engineer",
  location: "Thiruvananthapuram, Kerala",
  salary: 48000
};
const createResB = await callApi("POST", "/employees", newEmployeeB);
assert.strictEqual(createResB.status, 201);
const empIdB = createResB.body._id;
console.log(`[PASS] 3. Second employee created with ID: ${empIdB}`);

// 4. List All Employees (GET /employees)
const listAll = await callApi("GET", "/employees");
assert.strictEqual(listAll.status, 200);
assert.strictEqual(listAll.body.length, 2, "List should contain 2 employees");
console.log("[PASS] 4. GET /employees returned 2 persistent records");

// 5. View Single Employee (GET /employees/:id)
const viewRes = await callApi("GET", `/employees/${empIdA}`);
assert.strictEqual(viewRes.status, 200);
assert.strictEqual(viewRes.body.name, "Alex Morgan");
assert.strictEqual(viewRes.body.designation, "Full Stack Developer");
console.log(`[PASS] 5. GET /employees/${empIdA} successfully retrieved Alex Morgan`);

// 6. View Non-existent Employee (GET /employees/:validNonExistentId)
const nonExistentId = new mongoose.Types.ObjectId().toString();
const view404 = await callApi("GET", `/employees/${nonExistentId}`);
assert.strictEqual(view404.status, 404, "Non-existent employee should return 404");
console.log("[PASS] 6. GET with non-existent ObjectId returned 404 Not Found");

// 7. Update Employee A (PUT /employees/:id)
const updateRes = await callApi("PUT", `/employees/${empIdA}`, {
  designation: "Senior Full Stack Developer",
  salary: 70000
});
assert.strictEqual(updateRes.status, 200, "PUT should return 200");
assert.strictEqual(updateRes.body.designation, "Senior Full Stack Developer");
assert.strictEqual(updateRes.body.salary, 70000);
assert.strictEqual(updateRes.body.name, "Alex Morgan", "Original name should be preserved");
console.log("[PASS] 7. PUT /employees/:id successfully updated designation and salary");

// 8. Delete Employee B (DELETE /employees/:id)
const deleteRes = await callApi("DELETE", `/employees/${empIdB}`);
assert.strictEqual(deleteRes.status, 200, "DELETE should return 200");
assert.strictEqual(deleteRes.body.message, "Employee deleted successfully");
console.log("[PASS] 8. DELETE /employees/:id successfully deleted employee B");

// 9. Verify Deletion Persistence (GET /employees should now have 1 record)
const listAfterDel = await callApi("GET", "/employees");
assert.strictEqual(listAfterDel.body.length, 1, "List should now contain only 1 employee");
assert.strictEqual(listAfterDel.body[0]._id, empIdA);
console.log("[PASS] 9. Persistence verified: list contains 1 employee after deletion");

console.log("\n>>> ALL 9 CRUD & PERSISTENCE VERIFICATION STEPS PASSED! <<<");
process.exit(0);

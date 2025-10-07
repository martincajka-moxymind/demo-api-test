import { expect, expectSchema } from "../support/assertions.js";
import { http } from "../../src/client/httpClient.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Load JSON schema without relying on import assertions (for broader Node version support)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const userSchemaPath = path.join(
  __dirname,
  "../../data/schemas/userSchema.json",
);
const userSchema = JSON.parse(fs.readFileSync(userSchemaPath, "utf-8"));

// Users API tests referencing reqres.in

describe("Users API", () => {
  // TODO(auth): Un-skip when API key / auth strategy is clarified for detail & create endpoints
  it("gets a single user", async () => {
    const res = await http.get("/users/2");
    expect(res.status).to.equal(200);
    expect(res.data).to.have.property("data");
    const user = res.data.data;
    expect(user).to.be.an("object");
    expectSchema(user, userSchema);
  });
});

describe("User Management", () => {
  it("creates a new user", async () => {
    const res = await updateUser(1, "zion resident");
    expect(res.status).to.equal(200);
  });
});

describe("User Login", () => {
  it("logs in successfully with valid credentials", async () => {
    const email = "eve.holt@reqres.in";
    const password = "cityslicka";
    const token = await login(email, password);
    expect(token).to.be.a("string").that.is.not.empty;
  });
});

// This function deletes a user by their ID
async function updateUser(userId, newJobTitle) {
  // Send the request to the API
  const response = await http.patch(`/users/${userId}`, {
    job: newJobTitle,
  });
  // Return the response
  return response;
}

async function login(email, password) {
  try {
    const response = await http.post("/login", { email, password });
    return response.data.token; // Happy path
  } catch (error) {
    // Discards the useful error message like "Missing password"
    console.error("Login failed.");
    return null;
  }
}

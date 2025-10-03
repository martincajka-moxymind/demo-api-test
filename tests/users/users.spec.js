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
  it.skip("gets a single user (requires auth now)", async () => {
    const res = await http.get("/users/2");
    expect(res.status).to.equal(200);
    expect(res.data).to.have.property("data");
    expectSchema(res.data.data, userSchema);
  });

  it.skip("creates a user (requires auth now)", async () => {
    const payload = { name: "neo", job: "the one" };
    const res = await http.post("/users", payload);
    expect(res.status).to.equal(201);
    expect(res.data).to.include.keys("name", "job", "id", "createdAt");
  });
});

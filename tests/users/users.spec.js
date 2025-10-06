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
  it("gets a single user", async () => {
    const res = await http.get("/users/2");
    expect(res.status).to.equal(200);
    expect(res.data).to.have.property("data");
    const user = res.data.data;
    expect(user).to.be.an("object");
    expectSchema(user, userSchema);
  });
});

describe("Test", () => {
  it("gets a single user email", async () => {
    const email = await getUserEmail(2);
    expect(email).to.equal("janet.weaver@reqres.in");
  });
});

async function getUserEmail(userId) {
  const response = await http.get("/users/?page=1");
  const users = response.data.data;
  const targetUser = users.find((user) => user.id === userId);
  return targetUser ? targetUser.email : null;
}

import { expect, expectSchema } from "../support/assertions.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

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
    const user = await getAndProcessUser(2);
    expect(user).to.be.an("object");
    expectSchema(user, userSchema);
  });
});

function getAndProcessUser(userId) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-api-key": process.env.API_KEY,
  };
  return axios
    .get(`https://reqres.in/api/users/${userId}`, { headers })
    .then((response) => {
      console.log("User fetched:", response.data.data.first_name);
      // Chain another async action
      return axios
        .get(`https://reqres.in/api/users?delay=1`, { headers })
        .then((delayedResponse) => {
          console.log("Finished delayed response.");
          return response.data.data;
        });
    })
    .catch((err) => {
      console.error("Failed somewhere in the chain", err);
    });
}

import { expect } from "./support/assertions.js";
import { http } from "../src/client/httpClient.js";

// Basic health test hitting a known endpoint and validating structure

describe("API health", () => {
  it.skip("lists users (page 2)", async () => {
    const res = await http.get("/users?page=2");
    expect(res.status).to.equal(200);
    expect(res.data).to.have.property("page");
    expect(res.data).to.have.property("data");
    expect(res.data.page).to.equal(2);
  });
});

import { expect } from "../support/assertions.js";
import { http } from "../../src/client/httpClient.js";

describe("Resources API", () => {
  // TODO(auth): These endpoints return 401 (Missing API key). Re-enable when auth solution is added.
  it.skip("lists resources (requires auth now)", async () => {
    const res = await http.get("/unknown");
    expect(res.status).to.equal(200);
    expect(res.data).to.have.property("data");
    expect(res.data.data).to.be.an("array");
  });

  it.skip("gets single resource (requires auth now)", async () => {
    const res = await http.get("/unknown/2");
    expect(res.status).to.equal(200);
    expect(res.data).to.have.property("data");
  });
});

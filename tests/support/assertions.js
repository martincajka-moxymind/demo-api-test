import chai from "chai";
import chaiJsonSchema from "chai-json-schema";

chai.use(chaiJsonSchema);
export const { expect } = chai;

export function expectStatus(response, expected) {
  expect(response.status, "unexpected status code").to.equal(expected);
}

export function expectSchema(object, schema) {
  expect(object).to.be.jsonSchema(schema);
}

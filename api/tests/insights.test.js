const request = require("supertest");
const app = require("../app");

describe("Insights API", () => {
  test("GET /wellbeing/insights returns insights object", async () => {
    const res = await request(app).get("/wellbeing/insights");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("insight");
  });
});
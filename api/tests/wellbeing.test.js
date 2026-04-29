const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");

describe("Wellbeing API", () => {
  test("GET /wellbeing/moods returns an array", async () => {
    const res = await request(app).get("/wellbeing/moods");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /wellbeing/moods creates a valid mood", async () => {
    const res = await request(app)
      .post("/wellbeing/moods")
      .send({ mood: "good" });

    expect(res.statusCode).toBe(200);
    expect(res.body.mood).toBe(4);
    expect(res.body.label).toBe("Good");
  });

  test("POST /wellbeing/moods rejects invalid mood", async () => {
    const res = await request(app)
      .post("/wellbeing/moods")
      .send({ mood: "angry" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
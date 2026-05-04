const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/User");

describe("Auth API", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  test("POST /auth/register creates a valid user", async () => {
    const res = await request(app).post("/auth/register").send({
      displayName: "Khadija",
      email: "khadija@example.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.user.email).toBe("khadija@example.com");
    expect(res.body.user.displayName).toBe("Khadija");
    expect(res.body.user.id).toBeDefined();
    expect(res.body.user.password).toBeUndefined();
  });

  test("POST /auth/register rejects missing fields", async () => {
    const res = await request(app).post("/auth/register").send({
      email: "khadija@example.com",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("Missing required fields");
  });

  test("POST /auth/register rejects invalid email", async () => {
    const res = await request(app).post("/auth/register").send({
      displayName: "Khadija",
      email: "bad-email",
      password: "123456",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Please enter a valid email address");
  });

  test("POST /auth/register rejects short password", async () => {
    const res = await request(app).post("/auth/register").send({
      displayName: "Khadija",
      email: "khadija@example.com",
      password: "123",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Password must be at least 6 characters");
  });

  test("POST /auth/register rejects duplicate email", async () => {
    await request(app).post("/auth/register").send({
      displayName: "Khadija",
      email: "khadija@example.com",
      password: "123456",
    });

    const res = await request(app).post("/auth/register").send({
      displayName: "Khadija Two",
      email: "khadija@example.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.error).toBe("An account with this email already exists");
  });

  test("POST /auth/login logs in valid user", async () => {
    await request(app).post("/auth/register").send({
      displayName: "Khadija",
      email: "khadija@example.com",
      password: "123456",
    });

    const res = await request(app).post("/auth/login").send({
      email: "khadija@example.com",
      password: "123456",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe("khadija@example.com");
    expect(res.body.user.password).toBeUndefined();
  });

  test("POST /auth/login rejects empty email", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "",
      password: "123456",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("Missing required fields");
  });

  test("POST /auth/login rejects empty password", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "khadija@example.com",
      password: "",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("Missing required fields");
  });

  test("POST /auth/login rejects invalid email", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "not-email",
      password: "123456",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Please enter a valid email address");
  });

  test("POST /auth/login rejects short password", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "khadija@example.com",
      password: "123",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Password must be at least 6 characters");
  });

  test("POST /auth/login rejects wrong password", async () => {
    await request(app).post("/auth/register").send({
      displayName: "Khadija",
      email: "khadija@example.com",
      password: "123456",
    });

    const res = await request(app).post("/auth/login").send({
      email: "khadija@example.com",
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Invalid email or password");
  });

  test("GET /auth/user/:id returns user details", async () => {
    const created = await request(app).post("/auth/register").send({
      displayName: "Khadija",
      email: "khadija@example.com",
      password: "123456",
    });

    const res = await request(app).get(`/auth/user/${created.body.user.id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe("khadija@example.com");
    expect(res.body.user.password).toBeUndefined();
  });

  test("GET /auth/user/:id rejects invalid id", async () => {
    const res = await request(app).get("/auth/user/not-valid-id");

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Invalid user id");
  });

  test("GET /auth/user/:id returns 404 for missing user", async () => {
    const missingId = new mongoose.Types.ObjectId();

    const res = await request(app).get(`/auth/user/${missingId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("User not found");
  });

  test("DELETE /auth/user/:id deletes user", async () => {
    const created = await request(app).post("/auth/register").send({
      displayName: "Khadija",
      email: "khadija@example.com",
      password: "123456",
    });

    const res = await request(app).delete(`/auth/user/${created.body.user.id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("DELETE /auth/user/:id rejects invalid id", async () => {
    const res = await request(app).delete("/auth/user/not-valid-id");

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Invalid user id");
  });

  test("DELETE /auth/user/:id returns 404 for missing user", async () => {
    const missingId = new mongoose.Types.ObjectId();

    const res = await request(app).delete(`/auth/user/${missingId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("User not found");
  });
});
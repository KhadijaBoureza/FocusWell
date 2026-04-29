const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");

describe("Thoughts API", () => {
  test("GET /thoughts returns an array", async () => {
    const res = await request(app).get("/thoughts");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /thoughts creates a valid thought", async () => {
    const res = await request(app)
      .post("/thoughts")
      .send({
        content: "Test thought",
        category: "idea",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.content).toBe("Test thought");
    expect(res.body.category).toBe("idea");
    expect(res.body._id).toBeDefined();
  });

  test("POST /thoughts defaults category to reflection", async () => {
    const res = await request(app)
      .post("/thoughts")
      .send({
        content: "Default category thought",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.category).toBe("reflection");
  });

  test("POST /thoughts rejects missing content", async () => {
    const res = await request(app)
      .post("/thoughts")
      .send({
        category: "idea",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("Missing required fields");
  });

  test("POST /thoughts rejects invalid category", async () => {
    const res = await request(app)
      .post("/thoughts")
      .send({
        content: "Bad category",
        category: "random",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe(
      "Category must be one of: idea, worry, gratitude, reflection"
    );
  });

  test("PUT /thoughts/:id updates a thought", async () => {
    const created = await request(app)
      .post("/thoughts")
      .send({
        content: "Original thought",
        category: "reflection",
      });

    const res = await request(app)
      .put(`/thoughts/${created.body._id}`)
      .send({
        content: "Updated thought",
        category: "gratitude",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.content).toBe("Updated thought");
    expect(res.body.category).toBe("gratitude");
  });

  test("PUT /thoughts/:id rejects invalid id", async () => {
    const res = await request(app)
      .put("/thoughts/not-valid-id")
      .send({
        content: "Nope",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Invalid thought id");
  });

  test("PUT /thoughts/:id rejects invalid category", async () => {
    const created = await request(app)
      .post("/thoughts")
      .send({
        content: "Bad update",
      });

    const res = await request(app)
      .put(`/thoughts/${created.body._id}`)
      .send({
        category: "random",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe(
      "Category must be one of: idea, worry, gratitude, reflection"
    );
  });

  test("PUT /thoughts/:id returns 404 for missing thought", async () => {
    const missingId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .put(`/thoughts/${missingId}`)
      .send({
        content: "Missing",
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Thought not found");
  });

  test("DELETE /thoughts/:id deletes a thought", async () => {
    const created = await request(app)
      .post("/thoughts")
      .send({
        content: "Delete thought",
      });

    const res = await request(app).delete(`/thoughts/${created.body._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("DELETE /thoughts/:id rejects invalid id", async () => {
    const res = await request(app).delete("/thoughts/not-valid-id");

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Invalid thought id");
  });

  test("DELETE /thoughts/:id returns 404 for missing thought", async () => {
    const missingId = new mongoose.Types.ObjectId();

    const res = await request(app).delete(`/thoughts/${missingId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Thought not found");
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
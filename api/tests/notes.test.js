const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");

describe("Notes API", () => {
  test("GET /notes returns an array", async () => {
    const res = await request(app).get("/notes");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /notes creates a valid note", async () => {
    const res = await request(app)
      .post("/notes")
      .send({
        title: "Test note",
        content: "This is a test note",
        color: "blue",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Test note");
    expect(res.body.content).toBe("This is a test note");
    expect(res.body.color).toBe("blue");
    expect(res.body.createdAt).toBeDefined();
    expect(res.body._id).toBeDefined();
  });

  test("POST /notes rejects missing title", async () => {
    const res = await request(app)
      .post("/notes")
      .send({
        content: "Missing title",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("Missing required fields");
  });

  test("POST /notes rejects missing content", async () => {
    const res = await request(app)
      .post("/notes")
      .send({
        title: "Missing content",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("Missing required fields");
  });

  test("PUT /notes/:id updates a note", async () => {
    const created = await request(app)
      .post("/notes")
      .send({
        title: "Original note",
        content: "Original content",
      });

    const res = await request(app)
      .put(`/notes/${created.body._id}`)
      .send({
        title: "Updated note",
        content: "Updated content",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Updated note");
    expect(res.body.content).toBe("Updated content");
  });

  test("PUT /notes/:id rejects invalid id", async () => {
    const res = await request(app)
      .put("/notes/not-valid-id")
      .send({
        title: "Invalid",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Invalid note id");
  });

  test("PUT /notes/:id returns 404 for missing note", async () => {
    const missingId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .put(`/notes/${missingId}`)
      .send({
        title: "Missing",
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Note not found");
  });

  test("DELETE /notes/:id deletes a note", async () => {
    const created = await request(app)
      .post("/notes")
      .send({
        title: "Delete note",
        content: "Delete content",
      });

    const res = await request(app).delete(`/notes/${created.body._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("DELETE /notes/:id rejects invalid id", async () => {
    const res = await request(app).delete("/notes/not-valid-id");

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Invalid note id");
  });

  test("DELETE /notes/:id returns 404 for missing note", async () => {
    const missingId = new mongoose.Types.ObjectId();

    const res = await request(app).delete(`/notes/${missingId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Note not found");
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
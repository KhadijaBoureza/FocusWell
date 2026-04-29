const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");

describe("Tasks API", () => {
  test("GET /tasks returns an array", async () => {
    const res = await request(app).get("/tasks");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /tasks creates a valid task", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({
        title: "Test task",
        column: "todo",
        priority: "high",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Test task");
    expect(res.body.column).toBe("todo");
    expect(res.body.priority).toBe("high");
    expect(res.body.completed).toBe(false);
    expect(res.body._id).toBeDefined();
  });

  test("POST /tasks rejects missing title", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({ priority: "high" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("Missing required fields");
  });

  test("POST /tasks rejects invalid column", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({
        title: "Bad column",
        column: "doing",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Column must be one of: todo, inprogress, done");
  });

  test("POST /tasks rejects invalid priority", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({
        title: "Bad priority",
        priority: "urgent",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Priority must be one of: low, medium, high");
  });

  test("POST /tasks with done column marks completed", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({
        title: "Already done task",
        column: "done",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.column).toBe("done");
    expect(res.body.completed).toBe(true);
    expect(res.body.completedAt).toBeTruthy();
  });

  test("PUT /tasks/:id updates a task", async () => {
    const created = await request(app)
      .post("/tasks")
      .send({ title: "Task to update" });

    const res = await request(app)
      .put(`/tasks/${created.body._id}`)
      .send({
        title: "Updated task",
        priority: "low",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Updated task");
    expect(res.body.priority).toBe("low");
  });

  test("PUT /tasks/:id moves task to done and sets completedAt", async () => {
    const created = await request(app)
      .post("/tasks")
      .send({ title: "Complete this task" });

    const res = await request(app)
      .put(`/tasks/${created.body._id}`)
      .send({ column: "done" });

    expect(res.statusCode).toBe(200);
    expect(res.body.column).toBe("done");
    expect(res.body.completed).toBe(true);
    expect(res.body.completedAt).toBeTruthy();
  });

  test("PUT /tasks/:id rejects invalid id", async () => {
    const res = await request(app)
      .put("/tasks/not-valid-id")
      .send({ title: "Nope" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Invalid task id");
  });

  test("PUT /tasks/:id rejects invalid column", async () => {
    const created = await request(app)
      .post("/tasks")
      .send({ title: "Bad update column" });

    const res = await request(app)
      .put(`/tasks/${created.body._id}`)
      .send({ column: "doing" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Column must be one of: todo, inprogress, done");
  });

  test("PUT /tasks/:id rejects invalid priority", async () => {
    const created = await request(app)
      .post("/tasks")
      .send({ title: "Bad update priority" });

    const res = await request(app)
      .put(`/tasks/${created.body._id}`)
      .send({ priority: "urgent" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Priority must be one of: low, medium, high");
  });

  test("PUT /tasks/:id returns 404 for missing task", async () => {
    const missingId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .put(`/tasks/${missingId}`)
      .send({ title: "Missing" });

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Task not found");
  });

  test("DELETE /tasks/:id deletes a task", async () => {
    const created = await request(app)
      .post("/tasks")
      .send({ title: "Delete task" });

    const res = await request(app).delete(`/tasks/${created.body._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("DELETE /tasks/:id rejects invalid id", async () => {
    const res = await request(app).delete("/tasks/not-valid-id");

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Invalid task id");
  });

  test("DELETE /tasks/:id returns 404 for missing task", async () => {
    const missingId = new mongoose.Types.ObjectId();

    const res = await request(app).delete(`/tasks/${missingId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Task not found");
  });

  test("GET /tasks/completions returns an array", async () => {
    const res = await request(app).get("/tasks/completions");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");

describe("Achievements API", () => {
  test("GET /achievements returns an array", async () => {
    const res = await request(app).get("/achievements");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /achievements/unlock unlocks achievement", async () => {
    const res = await request(app)
      .post("/achievements/unlock")
      .send({
        badgeId: `test-badge-${Date.now()}`,
        progress: 10,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.badgeId).toContain("test-badge");
    expect(res.body.unlocked).toBe(true);
    expect(res.body.progress).toBe(10);
  });

  test("POST /achievements/unlock rejects missing badgeId", async () => {
    const res = await request(app)
      .post("/achievements/unlock")
      .send({ progress: 10 });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("badgeId is required");
  });

  test("POST /achievements/unlock rejects invalid progress", async () => {
    const res = await request(app)
      .post("/achievements/unlock")
      .send({
        badgeId: "bad-progress-badge",
        progress: "hello",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("progress must be a non-negative number");
  });

  test("POST /achievements/unlock rejects negative progress", async () => {
    const res = await request(app)
      .post("/achievements/unlock")
      .send({
        badgeId: "negative-progress-badge",
        progress: -1,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("progress must be a non-negative number");
  });

  test("PUT /achievements/:badgeId/progress updates progress", async () => {
    const badgeId = `progress-badge-${Date.now()}`;

    const res = await request(app)
      .put(`/achievements/${badgeId}/progress`)
      .send({ progress: 55 });

    expect(res.statusCode).toBe(200);
    expect(res.body.badgeId).toBe(badgeId);
    expect(res.body.progress).toBe(55);
  });

  test("PUT /achievements/:badgeId/progress defaults progress to 0", async () => {
    const badgeId = `default-progress-badge-${Date.now()}`;

    const res = await request(app)
      .put(`/achievements/${badgeId}/progress`)
      .send({});

    expect(res.statusCode).toBe(200);
    expect(res.body.badgeId).toBe(badgeId);
    expect(res.body.progress).toBe(0);
  });

  test("PUT /achievements/:badgeId/progress rejects invalid progress", async () => {
    const res = await request(app)
      .put("/achievements/bad-progress/progress")
      .send({ progress: "hello" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("progress must be a non-negative number");
  });

  test("PUT /achievements/:badgeId/progress rejects negative progress", async () => {
    const res = await request(app)
      .put("/achievements/negative-progress/progress")
      .send({ progress: -1 });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("progress must be a non-negative number");
  });

  test("GET /achievements/stats returns stats object", async () => {
    const res = await request(app).get("/achievements/stats");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("sessions");
    expect(res.body).toHaveProperty("minutes");
    expect(res.body).toHaveProperty("breaks");
    expect(res.body).toHaveProperty("tasksCompleted");
    expect(res.body).toHaveProperty("totalTasks");
    expect(res.body).toHaveProperty("notesCount");
    expect(res.body).toHaveProperty("thoughtsCount");
    expect(res.body).toHaveProperty("remindersCount");
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
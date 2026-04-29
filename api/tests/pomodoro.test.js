const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");

describe("Pomodoro API", () => {
  test("GET /pomodoro returns sessions summary", async () => {
    const res = await request(app).get("/pomodoro");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.sessions)).toBe(true);
    expect(Array.isArray(res.body.sessionLog)).toBe(true);
    expect(res.body).toHaveProperty("todayMinutes");
    expect(res.body).toHaveProperty("breaks");
    expect(res.body).toHaveProperty("durations");
  });

  test("POST /pomodoro/session creates valid work session", async () => {
    const res = await request(app)
      .post("/pomodoro/session")
      .send({
        mode: "work",
        duration: 25,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.mode).toBe("work");
    expect(res.body.duration).toBe(25);
    expect(res.body._id).toBeDefined();
  });

  test("POST /pomodoro/session rejects missing mode", async () => {
    const res = await request(app)
      .post("/pomodoro/session")
      .send({
        duration: 25,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("Missing required fields");
  });

  test("POST /pomodoro/session rejects missing duration", async () => {
    const res = await request(app)
      .post("/pomodoro/session")
      .send({
        mode: "work",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("Missing required fields");
  });

  test("POST /pomodoro/session rejects invalid mode", async () => {
    const res = await request(app)
      .post("/pomodoro/session")
      .send({
        mode: "focus",
        duration: 25,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe(
      "Mode must be one of: work, shortBreak, longBreak"
    );
  });

  test("POST /pomodoro/session rejects zero duration", async () => {
    const res = await request(app)
      .post("/pomodoro/session")
      .send({
        mode: "work",
        duration: 0,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Duration must be a positive number");
  });

  test("POST /pomodoro/session rejects negative duration", async () => {
    const res = await request(app)
      .post("/pomodoro/session")
      .send({
        mode: "work",
        duration: -5,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Duration must be a positive number");
  });

  test("POST /pomodoro/session rejects string duration", async () => {
    const res = await request(app)
      .post("/pomodoro/session")
      .send({
        mode: "work",
        duration: "25",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Duration must be a positive number");
  });

  test("GET /pomodoro/settings returns settings", async () => {
    const res = await request(app).get("/pomodoro/settings");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("work");
    expect(res.body).toHaveProperty("shortBreak");
    expect(res.body).toHaveProperty("longBreak");
  });

  test("PUT /pomodoro/settings updates settings", async () => {
    const res = await request(app)
      .put("/pomodoro/settings")
      .send({
        work: 30,
        shortBreak: 6,
        longBreak: 20,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.work).toBe(30);
    expect(res.body.shortBreak).toBe(6);
    expect(res.body.longBreak).toBe(20);
  });

  test("PUT /pomodoro/settings partially updates settings", async () => {
    const res = await request(app)
      .put("/pomodoro/settings")
      .send({
        work: 35,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.work).toBe(35);
  });

  test("PUT /pomodoro/settings rejects invalid work duration", async () => {
    const res = await request(app)
      .put("/pomodoro/settings")
      .send({
        work: 0,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("work must be a positive number");
  });

  test("PUT /pomodoro/settings rejects invalid shortBreak duration", async () => {
    const res = await request(app)
      .put("/pomodoro/settings")
      .send({
        shortBreak: -1,
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("shortBreak must be a positive number");
  });

  test("PUT /pomodoro/settings rejects invalid longBreak duration", async () => {
    const res = await request(app)
      .put("/pomodoro/settings")
      .send({
        longBreak: "15",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("longBreak must be a positive number");
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
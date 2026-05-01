const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");

const tomorrowDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

const yesterdayDate = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
};

describe("Reminders API", () => {
  test("GET /reminders returns an array", async () => {
    const res = await request(app).get("/reminders");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /reminders creates a valid reminder", async () => {
    const res = await request(app)
      .post("/reminders")
      .send({
        title: "Test reminder",
        date: tomorrowDate(),
        time: "10:00",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Test reminder");
    expect(res.body.date).toBe(tomorrowDate());
    expect(res.body.time).toBe("10:00");
    expect(res.body.completed).toBe(false);
    expect(res.body._id).toBeDefined();
  });

  test("POST /reminders rejects missing title", async () => {
    const res = await request(app)
      .post("/reminders")
      .send({
        date: tomorrowDate(),
        time: "10:00",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("Missing required fields");
  });

  test("POST /reminders rejects missing date", async () => {
    const res = await request(app)
      .post("/reminders")
      .send({
        title: "Missing date",
        time: "10:00",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("Missing required fields");
  });

  test("POST /reminders rejects missing time", async () => {
    const res = await request(app)
      .post("/reminders")
      .send({
        title: "Missing time",
        date: tomorrowDate(),
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("Missing required fields");
  });

  test("POST /reminders rejects past reminder", async () => {
    const res = await request(app)
      .post("/reminders")
      .send({
        title: "Past reminder",
        date: yesterdayDate(),
        time: "10:00",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Reminder date and time cannot be in the past");
  });

  test("PUT /reminders/:id updates a reminder", async () => {
    const created = await request(app)
      .post("/reminders")
      .send({
        title: "Original reminder",
        date: tomorrowDate(),
        time: "10:00",
      });

    const res = await request(app)
      .put(`/reminders/${created.body._id}`)
      .send({
        title: "Updated reminder",
        completed: true,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe("Updated reminder");
    expect(res.body.completed).toBe(true);
  });

  test("PUT /reminders/:id rejects invalid id", async () => {
    const res = await request(app)
      .put("/reminders/not-valid-id")
      .send({
        title: "Nope",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Invalid reminder id");
  });

  test("PUT /reminders/:id rejects past date and time", async () => {
    const created = await request(app)
      .post("/reminders")
      .send({
        title: "Reminder to update",
        date: tomorrowDate(),
        time: "10:00",
      });

    const res = await request(app)
      .put(`/reminders/${created.body._id}`)
      .send({
        date: yesterdayDate(),
        time: "10:00",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Reminder date and time cannot be in the past");
  });

  test("PUT /reminders/:id returns 404 for missing reminder", async () => {
    const missingId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .put(`/reminders/${missingId}`)
      .send({
        title: "Missing reminder",
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Reminder not found");
  });

  test("DELETE /reminders/:id deletes a reminder", async () => {
    const created = await request(app)
      .post("/reminders")
      .send({
        title: "Delete reminder",
        date: tomorrowDate(),
        time: "10:00",
      });

    const res = await request(app).delete(`/reminders/${created.body._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("DELETE /reminders/:id rejects invalid id", async () => {
    const res = await request(app).delete("/reminders/not-valid-id");

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Invalid reminder id");
  });

  test("DELETE /reminders/:id returns 404 for missing reminder", async () => {
    const missingId = new mongoose.Types.ObjectId();

    const res = await request(app).delete(`/reminders/${missingId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Reminder not found");
  });
});


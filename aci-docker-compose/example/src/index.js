const express = require("express");
const app = express();
const redis = require("redis");
const session = require("express-session");
const RedisStore = require("connect-redis")(session);

let client = redis.createClient({
  host: "localhost",
  port: 6123,
  password: "secret",
  db: 1,
});

client.on("error", console.error);

session({
  store: new RedisStore({ client }),
  saveUninitialized: false,
  secret: "amazing stuff",
  resave: false,
});

RedisStore["counter"] = 0;

app.get("/", (req, res) => {
  RedisStore["counter"]++;
  const counter = RedisStore["counter"];
  res.send(`Hello World!<br><p>Loaded ${counter} times.</p>`);
});

app.listen(3000, () => {
  console.log("Listening on port 3000!");
});

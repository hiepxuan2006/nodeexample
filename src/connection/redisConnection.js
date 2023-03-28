const redis = require("redis");

module.exports.connectRedis = async () => {
  const url = process.env.REDIS_URI;
  const client = redis.createClient({
    url,
    password: process.env.redisKey,
  });
  client.on("connect", () => console.log("DB redis connected"));
  client.on("error", (err) => console.log("client Connection Error", err));
  client.connect();
  return client;
};

import { Redis } from "iovalkey";

const valkey = new Redis({
  port: 6379,
  host: process.env.VALKEY_HOST!,
  username: "default",
  db: 0,
  tls: {
    rejectUnauthorized: false,
  },
});

export const handler = async (event: any) => {
  const value = await valkey.get("test-key");
  return {
    statusCode: 200,
    body: JSON.stringify(value),
  };
};

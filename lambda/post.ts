import { APIGatewayProxyEvent } from "aws-lambda";
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

export const handler = async (event: APIGatewayProxyEvent) => {
  if (!event.queryStringParameters?.key) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing key" }),
    };
  }

  if (!event.queryStringParameters.value) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing value" }),
    };
  }

  const value = await valkey.set(
    event.queryStringParameters.key!,
    event.queryStringParameters.value!
  );

  return {
    statusCode: 200,
    body: JSON.stringify(value),
  };
};

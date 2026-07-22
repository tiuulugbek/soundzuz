import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 10 },
    { duration: "1m", target: 50 },
    { duration: "30s", target: 100 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<800"],
  },
};

const baseUrl = __ENV.BASE_URL || "https://soundz.uz";
const apiUrl = __ENV.API_URL || "https://api.soundz.uz/v1";

export default function () {
  const responses = http.batch([
    ["GET", `${baseUrl}/`],
    ["GET", `${baseUrl}/eshitish-moslamalari`],
    ["GET", `${baseUrl}/ru`],
    ["GET", `${apiUrl}/health`],
  ]);
  responses.forEach((response) => check(response, { "status below 500": (result) => result.status < 500 }));
  sleep(1);
}

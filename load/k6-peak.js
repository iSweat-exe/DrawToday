// Load test: a peak of simultaneous users (20 by default, `VUS=…` to change) on a LOCAL build against a LOCAL Supabase (see docs/load-testing.md).
// Never point it at the production site: it would burn the free-tier quotas and could get the deployment paused.
//
// Each virtual user behaves like a phone user: open a page, read for a few seconds, open another one. Only HTML
// documents are requested (the worst case for the server: every visit is a full render), static assets are served
// by the CDN in production and cost no function invocation.
import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://host.docker.internal:3200";
const VUS = Number(__ENV.VUS || 20);
// Optional session cookie value of a signed-in user (`drawtoday-auth`), used by one VU out of five.
const AUTH_COOKIE_NAME = __ENV.AUTH_COOKIE_NAME || "";
const AUTH_COOKIE_VALUE = __ENV.AUTH_COOKIE_VALUE || "";

// The pages of the journey, in order. Add the real screens (exercise list, an exercise, a tip, a video) with the
// feature that creates them, so that the test always covers what users really do.
const JOURNEY = [{ path: "/", name: "home", marker: "DrawToday" }];

export const options = {
  stages: [
    { duration: "30s", target: VUS }, // everybody arrives within 30 s
    { duration: __ENV.HOLD || "120s", target: VUS }, // the peak
    { duration: "15s", target: 0 },
  ],
  thresholds: {
    // Targets written in docs/load-testing.md. A failed threshold makes k6 exit with a non-zero code.
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<800", "p(99)<2000"],
    checks: ["rate>0.99"],
  },
  summaryTrendStats: ["avg", "med", "p(90)", "p(95)", "p(99)", "max"],
};

/**
 * Fetches one page and checks that it really is the app (not an error page).
 * @param {{ path: string, name: string, marker: string }} page
 * @param {boolean} signedIn
 */
function visit(page, signedIn) {
  const params = { tags: { name: page.name } };
  if (signedIn && AUTH_COOKIE_NAME)
    params.headers = { Cookie: `${AUTH_COOKIE_NAME}=${AUTH_COOKIE_VALUE}` };
  const response = http.get(`${BASE_URL}${page.path}`, params);
  check(response, {
    [`${page.name}: status 200`]: (r) => r.status === 200,
    [`${page.name}: is the app`]: (r) => typeof r.body === "string" && r.body.includes(page.marker),
  });
}

export default function () {
  const signedIn = __VU % 5 === 0;
  for (const page of JOURNEY) {
    visit(page, signedIn);
    sleep(3 + Math.random() * 5); // reading time
  }
  sleep(5 + Math.random() * 10); // pause before starting over
}

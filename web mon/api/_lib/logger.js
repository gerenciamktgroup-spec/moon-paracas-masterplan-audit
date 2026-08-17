function safeErrorMessage(error) {
  return error instanceof Error ? error.message.slice(0, 300) : String(error || "unknown").slice(0, 300);
}

function write(level, payload) {
  const line = JSON.stringify({ level, timestamp: new Date().toISOString(), ...payload });
  if (level === "error") console.error(line);
  else console.log(line);
}

export function observeRequest(req, res, route) {
  const startedAt = Date.now();
  const requestId = String(req.headers["x-vercel-id"] || req.headers["x-request-id"] || "local").slice(0, 120);
  write("info", { message: "request_started", route, requestId, method: req.method });

  res.once?.("finish", () => {
    write("info", {
      message: "request_completed",
      route,
      requestId,
      method: req.method,
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });

  return {
    error(error, message = "request_failed", context = {}) {
      write("error", {
        message,
        route,
        requestId,
        method: req.method,
        durationMs: Date.now() - startedAt,
        error: safeErrorMessage(error),
        ...context,
      });
    },
  };
}

// Temporary test file — verifies a Netlify Function can call the /do-sync edge function.
// Delete this once confirmed working.

export default async (_req: Request) => {
    try {
        const res = await fetch("https://eduvidual-to-todoist.netlify.app/do-sync", {
            method: "POST",
            signal: AbortSignal.timeout(30000),
        });
        const body = await res.text();
        console.log(`[test-cron] status=${res.status} body=${body}`);
        return new Response(JSON.stringify({ status: res.status, body }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[test-cron] error: ${msg}`);
        return new Response(JSON.stringify({ error: msg }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};

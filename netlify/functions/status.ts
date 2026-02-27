import { getStore } from "@netlify/blobs";
import { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
    try {
        const password = event.queryStringParameters?.pwd;
        const correctPassword = process.env.STATUS_PASSWORD;

        // If a password is set in env vars, require it to see ANY detailed status.
        // If not set, we default to the safe "basic" view.
        const isAuthenticated = correctPassword && password === correctPassword;

        const store = getStore("sync-state");
        let data: any = null;
        
        try {
            data = await store.get("latest", { type: "json" });
        } catch (e) {
            // Store might not exist yet if cron hasn't run
            data = null;
        }

        if (!data) {
            return {
                statusCode: 200,
                body: JSON.stringify({ timestamp: null, status: "unknown" }),
            };
        }

        // If there's an error, only show the detail if authenticated
        if (data.status && data.status.includes("error") && !isAuthenticated) {
            data.status = "error"; // mask the detail
            data.message = "Authentication required to view error details.";
        }

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ timestamp: null, status: "error", message: "Internal Server Error" }),
        };
    }
};

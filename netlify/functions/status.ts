import { getStore } from "@netlify/blobs";
import type { Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
    try {
        const url = new URL(req.url);
        const password = url.searchParams.get("pwd");
        const correctPassword = process.env.STATUS_PASSWORD;

        const isAuthenticated = correctPassword && password === correctPassword;

        const store = getStore("sync-state");
        let data: any = null;
        
        try {
            data = await store.get("latest", { type: "json" });
        } catch (e: any) {
            console.error("Blob error:", e);
            data = null;
        }

        if (!data) {
            return new Response(JSON.stringify({ timestamp: null, status: "unknown" }), {
                headers: { "Content-Type": "application/json" },
            });
        }

        if (data.status && data.status.includes("error") && !isAuthenticated) {
            data.status = "error";
            data.message = "Authentication required to view error details.";
        }

        return new Response(JSON.stringify(data), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: any) {
        console.error("Outer error:", error);
        return new Response(JSON.stringify({ timestamp: null, status: "error", message: error.message || "Internal Server Error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};

import { getStore } from '@netlify/blobs';
import { TodoistApi, AddTaskArgs } from '@doist/todoist-api-typescript';
import ical, { VEvent } from 'node-ical';
import * as https from 'https';

const fetchIcalViaHttps = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const req = https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/calendar, text/plain, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Connection': 'keep-alive'
            },
            timeout: 8000
        }, (res) => {
            if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                // follow 1 redirect
                resolve(fetchIcalViaHttps(res.headers.location));
                return;
            }
            
            if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
                res.resume(); // consume response data to free up memory
                reject(new Error(`HTTP Error ${res.statusCode}: ${res.statusMessage}`));
                return;
            }
            
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(data));
        });
        
        req.on('error', (e) => reject(e));
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('HTTPS connection timed out (8000ms limit reached)'));
        });
    });
};

export const runSync = async (): Promise<Response> => {
    const store = getStore("sync-state");
    
    try {
        console.log("Sync started...");
        const todoistToken = process.env.TODOIST_API_TOKEN;
        const icalUrl = process.env.EDUVIDUAL_ICAL_URL;
        const projectId = process.env.TODOIST_PROJECT_ID;
        
        if (!todoistToken || !icalUrl) {
            console.error("Missing environment variables.");
            await store.setJSON("latest", { timestamp: new Date().toISOString(), status: "error: missing env vars" });
            return new Response("Missing env vars", { status: 500 });
        }
        
        const todoist = new TodoistApi(todoistToken);
        
        console.log("Fetching iCal feed...");
        
        // Log partially redacted URL for debug
        try {
            const parsedUrl = new URL(icalUrl);
            console.log(`Target: ${parsedUrl.protocol}//${parsedUrl.hostname}${parsedUrl.pathname}...`);
        } catch (e) {
            console.error("Invalid EDUVIDUAL_ICAL_URL format.");
            await store.setJSON("latest", { timestamp: new Date().toISOString(), status: "error: Invalid URL format in EDUVIDUAL_ICAL_URL" });
            return new Response("Invalid URL", { status: 500 });
        }

        let events;
        try {
            const icalData = await fetchIcalViaHttps(icalUrl);
            events = await ical.async.parseICS(icalData);
        } catch (icalError: unknown) {
            console.error("Failed to fetch or parse iCal URL:", icalError);
            
            let errorMessage = icalError instanceof Error ? icalError.message : String(icalError);
            
            // Extract detailed network error cause in Node.js 18+ (e.g., DNS issues, connection refused)
            if (icalError && typeof icalError === 'object' && 'cause' in icalError) {
                const cause = (icalError as any).cause;
                if (cause) {
                    errorMessage += ` (Cause: ${cause?.message || cause?.code || String(cause)})`;
                }
            }

            await store.setJSON("latest", { timestamp: new Date().toISOString(), status: `error: Failed to fetch iCal feed - ${errorMessage}` });
            return new Response("iCal error", { status: 500 });
        }
        
        const eventList = Object.values(events).filter(e => e && e.type === 'VEVENT');
        console.log(`Found ${eventList.length} events in feed.`);
        
        let processedIds: string[] = [];
        try {
            const storedIds = await store.get("processed-events", { type: "json" });
            if (Array.isArray(storedIds)) {
                processedIds = storedIds;
            }
        } catch (e) {
            console.log("No processed events found, starting fresh.");
        }
        const processedSet = new Set(processedIds);
        
        const now = new Date();

        for (const item of eventList) {
            const eventItem = item as VEvent;
            const summary = typeof eventItem.summary === 'string' ? eventItem.summary : eventItem.summary?.val;
            const end = eventItem.end;
            const uid = eventItem.uid;
            
            const eventUrl = typeof eventItem.url === 'string' ? eventItem.url : (eventItem.url as { val?: string } | undefined)?.val;
            const eventDescription = typeof eventItem.description === 'string' ? eventItem.description : (eventItem.description as { val?: string } | undefined)?.val;
            
            if (!summary || !end || !uid) continue;

            const originalDate = new Date(end);
            
            if (originalDate < now) {
                console.log(`Skipping past event: ${summary}`);
                continue;
            }
            
            if (processedSet.has(uid)) {
                console.log(`Skipping already processed task: ${summary}`);
                continue;
            }
            
            const shiftedDate = new Date(originalDate.getTime() - (24 * 60 * 60 * 1000));
            
            let taskDescription = "";
            if (eventDescription) taskDescription += `${eventDescription}\n\n`;
            if (eventUrl) taskDescription += `🔗 Link: ${eventUrl}`;
            
            const taskArgs: AddTaskArgs = {
                content: summary,
                description: taskDescription.trim(),
                ...(projectId && { projectId }),
                ...(eventItem.datetype === 'date' 
                    ? { dueDate: shiftedDate.toISOString().split('T')[0] }
                    : { dueDatetime: shiftedDate.toISOString() }
                )
            };
            
            console.log(`Creating task: "${summary}" | Due: ${taskArgs.dueDate || taskArgs.dueDatetime}`);
            try {
                await todoist.addTask(taskArgs);
                processedSet.add(uid);
                await store.setJSON("processed-events", Array.from(processedSet));
            } catch (taskError: unknown) {
                console.error(`Failed to create task ${summary}:`, taskError);
            }
        }
        
        console.log("Sync completed successfully.");
        await store.setJSON("latest", { timestamp: new Date().toISOString(), status: "success" });
        return new Response("OK", { status: 200 });
    } catch (error: unknown) {
        console.error("Critical Error during sync:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        await store.setJSON("latest", { timestamp: new Date().toISOString(), status: `error: Critical Sync Failure - ${errorMessage}` });
        return new Response("Error", { status: 500 });
    }
};
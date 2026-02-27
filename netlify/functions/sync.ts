import { schedule } from '@netlify/functions';
import { TodoistApi } from '@doist/todoist-api-typescript';
import ical from 'node-ical';

export const handler = schedule("0 * * * *", async (event) => {
    try {
        console.log("Sync started...");
        const todoistToken = process.env.TODOIST_API_TOKEN;
        const icalUrl = process.env.EDUVIDUAL_ICAL_URL;
        
        if (!todoistToken || !icalUrl) {
            console.error("Missing environment variables.");
            return { statusCode: 500 };
        }
        
        const todoist = new TodoistApi(todoistToken);
        const events = await ical.async.fromURL(icalUrl);
        const eventList = Object.values(events).filter(e => e.type === 'VEVENT');
        
        const tasksResponse = await todoist.getTasks();
        const activeTaskNames = new Set(tasksResponse.results.map((t: any) => t.content));
        
        for (const item of eventList) {
            const eventItem = item as any;
            const summary = eventItem.summary;
            const end = eventItem.end;
            
            if (!summary || !end) continue;
            
            if (activeTaskNames.has(summary)) {
                console.log(`Skipping duplicate task: ${summary}`);
                continue;
            }
            
            const originalDate = new Date(end);
            const shiftedDate = new Date(originalDate.getTime() - (24 * 60 * 60 * 1000));
            
            console.log(`Creating task: "${summary}" | Due: ${shiftedDate.toISOString()}`);
            await todoist.addTask({
                content: summary,
                dueDate: shiftedDate.toISOString().split('T')[0],
            });
        }
        
        console.log("Sync completed successfully.");
        return { statusCode: 200 };
    } catch (error) {
        console.error("Error during sync:", error);
        return { statusCode: 500 };
    }
});

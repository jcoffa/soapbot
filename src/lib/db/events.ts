import sqlite3 from "sqlite3";
import {
    allWithParams,
    getWithParams,
    runWithParams,
} from "../../scripts/sqlite/sqlite_lib";

export interface DiscordEvent {
    id: string;
    guild_id: string;
    role_id: string;
    name?: string;
    description?: string;
    scheduled_start_at?: string;
    scheduled_end_at?: string;
    subscriber_num?: number;
    location?: string;
    image_url?: string;
    is_past: boolean;
}

export const fetchEvent = async (eventId: string): Promise<DiscordEvent> => {
    const db = new sqlite3.Database("soapbot.db");
    try {
        const res: DiscordEvent = await getWithParams(
            db,
            "SELECT * FROM events WHERE id=?",
            [eventId]
        );
        return res;
    } catch (error) {
        console.log(error);
    } finally {
        db.close();
    }
};

export const fetchByGuild = async (guildId: string) => {
    const db = new sqlite3.Database("soapbot.db");
    try {
        const res: DiscordEvent[] = await allWithParams(
            db,
            "SELECT * FROM events WHERE guild_id=?",
            [guildId]
        );
        return res;
    } catch (error) {
        console.log(error);
    } finally {
        db.close();
    }
};

export const fetchPastEvents = async (guildId: string) => {
    const db = new sqlite3.Database("soapbot.db");
    try {
        const res: DiscordEvent[] = await allWithParams(
            db,
            "SELECT * FROM events WHERE guild_id=? AND is_past=TRUE ORDER_BY scheduled_end_at LIMIT 50",
            [guildId]
        );
        return res;
    } catch (error) {
        console.log(error);
    } finally {
        db.close();
    }
};

export const addNewEvent = async (event: DiscordEvent) => {
    const db = new sqlite3.Database("soapbot.db");
    try {
        await runWithParams(
            db,
            "INSERT INTO events (id, guild_id, role_id, name, description, scheduled_start_at, location, image_url, is_past) " +
                `VALUES (?, ?, ?, ?, ?, ?, ?, ?, FALSE)`,
            [
                event.id,
                event.guild_id,
                event.role_id,
                event.name,
                event.description,
                event.scheduled_start_at,
                event.location,
                event.image_url,
            ]
        );
    } catch (error) {
        console.log(error);
    } finally {
        db.close();
    }
};

export const updateToPastEvent = async (event: DiscordEvent) => {
    const db = new sqlite3.Database("soapbot.db");
    try {
        await runWithParams(
            db,
            "UPDATE events SET scheduled_end_at=?, is_past=TRUE WHERE id=?",
            [event.scheduled_end_at, event.id]
        );
    } catch (error) {
        console.log(error);
    } finally {
        db.close();
    }
};

export const updateEvent = async (event: DiscordEvent) => {
    const db = new sqlite3.Database("soapbot.db");
    try {
        await runWithParams(
            db,
            "UPDATE events SET name=?, description=?, scheduled_start_at=?, location=?, image_url=? WHERE id=?",
            [
                event.name,
                event.description,
                event.scheduled_start_at,
                event.location,
                event.image_url,
                event.id,
            ]
        );
    } catch (error) {
        console.log(error);
    } finally {
        db.close();
    }
};

export const updateSubscriberNum = async (
    eventId: string,
    increment: boolean
) => {
    const db = new sqlite3.Database("soapbot.db");
    try {
        const event = await fetchEvent(eventId);
        const newSubscriberNum = increment
            ? event.subscriber_num + 1
            : event.subscriber_num - 1;
        await runWithParams(
            db,
            "UPDATE events SET subscriber_num=? WHERE id=?",
            [newSubscriberNum, event.id]
        );
    } catch (error) {
        console.log(error);
    } finally {
        db.close();
    }
};

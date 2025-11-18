/*
 * Copyright (C) 2024  Sage Beluli
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * Contact details for information regarding this program and its license
 * can be found on sophiabeluli.ca
 */

import "dotenv/config";
import fs from "node:fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Events, GatewayIntentBits } from "discord.js";
import CustomClient from "../CustomClient";
import { eventsRolesInfo } from "..";
import allCommands from "../commands";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fileName = "saved.json";
const file = __dirname + "/../" + fileName;

let eventsRoles = new Map<any, any>();

// Load Data
if (!fs.existsSync(file)) {
    console.warn("File doesnt exist");
    const content = JSON.stringify({});
    fs.writeFileSync(file, content, "utf8");
}
let eventRolesString = JSON.parse(fs.readFileSync(file, "utf8"));
eventsRoles = new Map(Object.entries(eventRolesString));

if (typeof eventsRoles.values().next().value === "string") {
    // need to migrate
    console.log("Migration needed.");
    // Create a new client instance
    const client = new CustomClient({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildScheduledEvents,
        ],
    });

    for (const command of allCommands) {
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        client.commands.set(command.data.name, command);
    }

    // Log in to Discord with your client's token
    client.login(process.env.TOKEN);

    client.once(Events.ClientReady, async (readyClient) => {
        console.log(`Ready to migrate! Logged in as ${readyClient.user.tag}`);
        let newEventsRoles = new Map<string, eventsRolesInfo>();

        // search for event in all guilds
        console.log(eventsRoles);
        migrate(client, newEventsRoles).then(() => {
            fs.writeFileSync(
                file,
                JSON.stringify(Object.fromEntries(newEventsRoles)),
                "utf8"
            );
            console.log("File Updated");
            console.log("Migration Finished.");
            client.destroy();
        });
    });
} else {
    console.log("Migration not needed.");
}

const migrate = async (
    client: CustomClient,
    newEventsRoles: Map<string, eventsRolesInfo>
): Promise<number> => {
    const guilds = await client.guilds.fetch();
    for (const guildInfo of guilds) {
        const guild = await guildInfo[1].fetch();
        const events = await guild.scheduledEvents.fetch();
        eventsRoles.forEach((role: string, event: string) => {
            const eventObj = events.get(event);
            if (eventObj) {
                console.log("adding new event structure for " + event);
                newEventsRoles.set(event, {
                    role: role,
                    guild: guild.id,
                    name: eventObj.name,
                    description: eventObj.description,
                    scheduledStartAt: eventObj.scheduledStartAt,
                });
            }
        });
    }
    return 0;
};

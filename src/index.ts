import { extendRanges, getClient, login } from "./constants/func";
import { messageHandler } from "./handlers/message";
import voftheday from "../votd.json";
import { VOTD } from "./handlers/VOTD";
import fs from "fs";
import schedule from "node-schedule";
import CommandManager from "./handlers/commands";
import { Client, GuildMember, Message } from "discord.js";
import { Store } from "./constants/keyv";
import KeyvFile from "keyv-file";
import { match } from "./constants/match";
import { reference } from "./types/reference";
import { get_reference } from "./constants/get_reference";

const client: Client = getClient();
export const Manager: CommandManager = new CommandManager(client);
Manager.loadCommands("C:/Users/Aidan/Desktop/LDS-Bot/dist/src/components/commands");
export const commands = Manager.commands;

export const bible = new Store({ 
	store: new KeyvFile({
		filename: "C:/Users/Aidan/Desktop/LDS-Bot/src/database/bible.json", 
		writeDelay: 100, 
		encode: JSON.stringify,
		decode: JSON.parse 
	})
});

export const votd: VOTD = new VOTD();

export const votdverse = fs.readFileSync("./votdverse.txt", "utf8");
export let randomVOTD: number;

if (votdverse != "") randomVOTD = parseInt(votdverse);
else {
	randomVOTD = Math.floor(Math.random() * voftheday.verses.length+1); 
	fs.writeFileSync("./votdverse.txt", randomVOTD.toString());
}
schedule.scheduleJob("0 0 * * *", () => {
	randomVOTD = Math.floor(Math.random() * voftheday.verses.length+1); 
	fs.writeFileSync("./votdverse.txt", randomVOTD.toString());
});

async function main () {
	client
		.on("ready", async () => {
			votd.setup();    
			console.log("READY!");
		})
		.on("messageCreate", messageHandler)
		.on("interactionCreate", async (i) => {
    
			if (i.isButton()) {
				if (i.customId.startsWith("delete")) {
					if (!i.member) return;
					const member = await (<GuildMember>i.member).fetch();
					const user_id = i.customId.split("_")[1];
					if (member.permissions.has("ManageMessages") || member.user.id === user_id) {
						const m = await (<Message>i.message).fetch();
          
						m.delete().catch((e) => {console.log(e);});
					} else {
						i.reply({content: "You cannot delete this reference as you were not the one to reference it OR you don't have MANAGE_MESSAGE perms", ephemeral: true});
					}
				}

				if (i.customId === "NEXT_O" || i.customId === "PREVIOUS_O") {
					const m = await (i.message as Message).fetch();
					const embed = m.embeds[0];
					if (!embed || !embed.title || !embed.footer || !embed.footer.text) return;
        
					const footer = embed.footer.text;
					const title = embed.title;
					const page = parseInt(footer.split("Page:")[1].trim()) - 1;
					const reference = title.trim();
					const mf = match(reference);

					const get_verses = extendRanges(mf[0].verses);
					const fetch_reference: reference | void = get_reference({book: mf[0].from, sub_book: mf[0].sub_book_idx, chapter: parseInt(mf[0].chapter)-1, verses: get_verses! });
					if (!fetch_reference) return;
    
					const thing = fetch_reference.text[i.customId === "NEXT_O" ? (page === fetch_reference.text.length - 1 ? 0 : page + 1) : (page === 0 ? fetch_reference.text.length - 1 : page - 1)];

					i.update({embeds:[{
						color: 0x086587,
						title: fetch_reference.reference + (mf[0].from === "ot" || mf[0].from === "nt" ? " (KJV) " : ""), 
						description: thing, 
						footer: {
							text: "LDS-Bot | " + fetch_reference.main_book + ` | Page: ${i.customId === "NEXT_O" ? (page === fetch_reference.text.length - 1 ? 1 : page + 2) : (page === 0 ? fetch_reference.text.length : page)}`,
							icon_url: client.user!.displayAvatarURL()
						}
					}]});
				}
			}

			if (!i.isCommand()) return;
			const commandName = i.commandName;
			if (commands.has(commandName.toLowerCase()) || commands.find((cmd: any) => cmd.aliases && cmd.aliases.includes(commandName.toLowerCase()))) {
				const command = commands.get(commandName.toLowerCase()) || commands.find((cmmd: any) => cmmd.aliases && cmmd.aliases.includes(commandName.toLowerCase()));
      
				if (!command) return;

				try {
					command.execute_slash(i);
				} catch (error) {
					console.error(error);
					await i.reply({ content: "There was an error while executing this command!", ephemeral: true });
				}
			} else return;
		});
	login();
}

main();
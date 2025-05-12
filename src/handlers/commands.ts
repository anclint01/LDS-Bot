import BaseCommand from '../types/command';
import { readdirSync } from  "fs";
import { sep } from "path";
import { Client, Collection, Message } from 'discord.js';

export default class CommandManager {
  client: Client;
  commands: Collection<string, any>
  slash_commands: any[];

  constructor (client: Client) {
    this.client = client;
    this.commands = new Collection();
    this.slash_commands = [];

    if (!this.client || !(this.client instanceof Client)) {
      throw new Error ("Discord Client is required")
    }
  }

  async loadCommands (dir: string) { 
    console.log("test ??")
    readdirSync(`${dir}${sep}`).forEach(async dirs => {
      const commandFiles = readdirSync(`${dir}${sep}${dirs}${sep}`).filter(files => files.endsWith(".js"));
      for (const file of commandFiles) {
        const location: string = `${dir}/${dirs}/${file}`;

        this.initiateModule(location);
      }
    })
    return true;
  }

  helpInfo (category?: string) { 
    let commandHelp = "";
    if (category) {
      if (["fun", "moderation", "owner", "util"].includes(category.toLowerCase())) {
        let specificCategory = `-------------------------------\n# ${category.toLowerCase()}\n-------------------------------\n`;
        this.commands.forEach((c: BaseCommand) => {
          if (c.category == category.toLowerCase()) {
            specificCategory += `${c.name} - ${c.description}\n`;
          }  
        })
        commandHelp = specificCategory;  
        return commandHelp;
      } else {
        let specificCommand = "";
        this.commands.forEach((c: BaseCommand) => {
          if (c.name == category.toLowerCase()) {
            specificCommand += `\`${c.name}\`\n  - ${c.description}\n`;
          }  
        })
        if (specificCommand == "") return "There is no command with that name"
        else return specificCommand;
      }
    } else {
      let desc: string = "";
      this.commands.forEach((c: BaseCommand) => {
        desc += `\`${c.name}${(c.usage != "" ? " " + c.usage : "")}\` ${c.description} \n`
      })
      return desc;
    }
  }

  initiateModule (location: string, r?: Boolean) {
    const req = require(location);
    const Command = new req();

    if (this.commands.has(Command.name)) return console.log("This command has already been initiated!");
    else {
      if (this.commands.get(Command.name)) return console.warn(`Two or more commands have the same name ${Command.name}.`);
      try {
        this.slash_commands.push(Command.data);
        this.commands.set(Command.name, Command);
        console.log(`${r ? "Reloaded" : "Loaded"} command ${Command.name}.`);
      } catch (e) {
        console.log(`Error loading command in ${location}: ${e}`);
      }
    }
  }

  async reloadCommands () {
    this.commands = new Collection();

    console.log("Reloading commands...");
    await this.loadCommands("../components/commands");
    console.log("Successfully reloaded commands");

    return true;
  }

  async reloadCommand (commandName: string) {
    const command: BaseCommand = this.commands.get(commandName) as BaseCommand;
    if (!command) return console.log("This is not a valid command.");
    const category = command.category;
    const name = command.name;

    this.commands.delete(commandName);
    delete require.cache[require.resolve(`../components/commands/${category}/${name}.ts`)];

    this.initiateModule(`../components/commands/${category}/${name}.ts`, true)
    return true;
  }
}
  

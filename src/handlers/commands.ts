import BaseCommand from '../command';
import { readdirSync } from  "fs";
import { sep } from "path";
import { Client, Collection, Message } from 'discord.js';

export default class CommandManager {
  client: Client;
  commands: Collection<string, any>

  constructor (client: Client) {
    this.client = client;
    this.commands = new Collection();

    if (!this.client || !(this.client instanceof Client)) {
      throw new Error ("Discord Client is required")
    }
  }

  async loadCommands (dir: string) { 
    readdirSync(dir).forEach(async dirs => {
      const commandFiles = readdirSync(`${dir}${sep}${dirs}${sep}`).filter(files => files.endsWith(".ts"));
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
            specificCategory += `${c.name}:\n  - ${c.description}\n`;
          }  
        })
        commandHelp = specificCategory;  
        return commandHelp;
      } else {
        let specificCommand = "";
        this.commands.forEach((c: BaseCommand) => {
          if (c.name == category.toLowerCase()) {
            specificCommand += `${c.name}:\n  - ${c.description}\n`;
          }  
        })
        if (specificCommand == "") return "There is no command with that name"
        else return specificCommand
      }
    } else {
/*      let about = "-------------------------------\n# About\n-------------------------------\n",
          info = "-------------------------------\n# Info\n-------------------------------\n",
          other_book_content = "-------------------------------\n# Other Book Content\n-------------------------------\n",
          util = "-------------------------------\n# Util\n-------------------------------\n"*/
      let desc: string = "";
      this.commands.forEach((c: BaseCommand) => {
        desc += `\`${c.name}${(c.usage != "" ? " " + c.usage : "")}\` ${c.description} \n`


        /*switch (c.category) {
          case "about":
            desc += `${c.name + " " + c.usage}:\n  - ${c.description}\n`
            break
          case "info":
            desc += `${c.name + " " + c.usage}:\n  - ${c.description}\n`
            break
          case "other_book_content":
            desc += `${c.name + " " + c.usage }:\n  - ${c.description}\n`
            break
          case "util":
            desc += `${c.name + " " + c.usage}:\n  - ${c.description}\n`
            break                              
        }*/
      })
      //commandHelp = about + info + other_book_content + util;
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

  executeCommand (command: any, message: Message, args: Array<string>, edited: Boolean) {
    try {
      command.execute(message, args, edited)
    } catch (e) {
      console.log(`Failed to execute command: ${e}`)
    }
  }
}
  
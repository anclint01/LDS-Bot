import { ChatInputApplicationCommandData } from "discord.js";

export default class BaseCommand {
  name: string;
  category: string;
  description: string;
  data: ChatInputApplicationCommandData;
  usage?: string;
  aliases?: Array<string>;
  ownerOnly?: Boolean;
  constructor (name: string, category: string, description: string, data?: ChatInputApplicationCommandData, usage?: string, aliases?: Array<string>, ownerOnly?: Boolean) {
    this.name = name;
    this.category = category;
    this.description = description || '';
    this.usage = usage || '';
    this.aliases = aliases || [];
    this.ownerOnly = ownerOnly || false
    this.data = {name: "none", description: "none"};
  } 
}
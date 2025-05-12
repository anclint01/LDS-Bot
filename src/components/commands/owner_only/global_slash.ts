
import { Message } from 'discord.js'
import BaseCommand from '../../../types/command'
import { token } from '../../../../config.json'
import { getClient } from '../../../constants/func';
import { Manager } from '../../..';
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const client = getClient();

class Command extends BaseCommand {
  constructor () {
    super ("rsc", "owner_only", "rsc")
  }
  async execute (message: Message, args?: string[]) {
    if (message.author.id != "") return;

    const rest = new REST({ version: '10' }).setToken("");
    
    (async () => {
      try {
        console.log('Started refreshing application (/) commands.');
    
        await rest.put(
          Routes.applicationCommands(client.user!.id),
          { body: Manager.slash_commands },
        );
    
        console.log('Successfully reloaded application (/) commands.');
      } catch (error) {
        console.error(error);
      }
    })();  
  }
}

export = Command

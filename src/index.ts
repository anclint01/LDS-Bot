import { getClient, login } from './other/func';
import { messageHandler } from './handlers/message';
import voftheday from "../votd.json";
import { VOTD } from './handlers/VOTD';
import fs from "fs";
import schedule from "node-schedule";
import Database from 'better-sqlite3';

const client = getClient();
export const options = new Database('database/options');


export const votd: VOTD = new VOTD();
votd.setup();

export const votdverse = fs.readFileSync('./votdverse.txt', 'utf8');
export let randomVOTD: number;

if (votdverse != '') randomVOTD = parseInt(votdverse);
else {
  randomVOTD = Math.floor(Math.random() * voftheday.verses.length+1); 
  fs.writeFileSync('./votdverse.txt', randomVOTD.toString());
}
schedule.scheduleJob('0 0 * * *', () => {
  randomVOTD = Math.floor(Math.random() * voftheday.verses.length+1); 
  fs.writeFileSync('./votdverse.txt', randomVOTD.toString());
});

async function main () {
  client
  .on('ready', async () => {
    let options_table;
    try {
      options_table = await options.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'options';").get();
    } catch (err) {
      console.log(err)
    }
    if (!options_table['count(*)']) {
      try {
        options.prepare("CREATE TABLE options (guildID TEXT, bible TEXT);").run();              
      } catch (err) {
        console.log(err)
      }      
    }
    
    console.log("READY!");
  })
  .on('messageCreate', messageHandler);
  
  login();
}

main();
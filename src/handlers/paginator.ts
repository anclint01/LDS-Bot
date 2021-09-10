import { ButtonInteraction, CommandInteraction, InteractionCollector, Message, User } from "discord.js";
import { getClient } from "../constants/func";

export class Paginator {
  user: User;
  message: Message | undefined;
  initial: any;
  pages: any;
  interaction?: ButtonInteraction | CommandInteraction;
  p: number | undefined;

  constructor (user: User, initial: any, pages: any, message?: Message, interaction?: ButtonInteraction | CommandInteraction, p?: number | undefined) {
    this.user = user;
    this.message = message || undefined;
    this.initial = initial;
    this.pages = pages;
    this.interaction = interaction || undefined;
    this.p = p || undefined;
  }

  async _new () {
    const buttons: Array<any> = [{
      type: "ACTION_ROW",
      components: [
        { type: "BUTTON", customId: `PREVIOUS`, label: "Prev.", style: "PRIMARY" },
        { type: "BUTTON", customId: `NEXT`,     label: "Next.", style: "PRIMARY" }
      ]
    }];

    if (!this.interaction) {
      this.message = await this.message?.channel.send({ content: "‎‎‎", embeds: [this.initial], components: buttons }).catch((err: any) => {
        console.log("Something went wrong: " + err)
      }) as Message;
      this.p = 0;
    } else {
      let fetch = await this.interaction.reply({ content: "‎‎‎", embeds: [this.p ? this.initial : this.pages[this.p!]], components: buttons, ephemeral: (this.p ? true : false), fetchReply: true}).catch((err: any) => {
        console.log("Something went wrong: " + err)
      });
      this.message = fetch as Message;
      this.p === undefined ? this.p = 0 : this.p = this.p;
    }
    const filter = (interaction: ButtonInteraction) => interaction.isButton() && interaction.user.id != getClient().user!.id;
    const paginator: InteractionCollector<ButtonInteraction> = this.message?.createMessageComponentCollector({filter, time: 600000, componentType: "BUTTON"})!;

    const id = this.user.id;
    paginator.on('collect', async i => {
      if (id === i.user.id) this.page(i);
      else new Paginator(i.user as User, this.pages[this.p ? this.p : 0], this.pages, undefined, i, this.p ? this.p : 0)._new();
    });
    
    paginator.on("end", () =>{
      this.message ? this.message?.edit({components: []}) : console.log("ummm, message deleted ig");
    });
  }

  async page (i: ButtonInteraction) {   
    let ACTION: string = i.customId; 

    if (this.p === 0 && ACTION === "PREVIOUS" || (this.p === this.pages.length - 1 && ACTION === "NEXT")) {
      this.p = (ACTION == "PREVIOUS" ? this.pages.length : -1);
    }
    this.p = ACTION === "PREVIOUS" ? this.p! - 1 : this.p! + 1;
    
    await i.update({embeds: [this.pages[this.p]]}).catch((err: any) => console.log("Something went wrong: " + err));
  }
} 

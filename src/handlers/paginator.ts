import { ButtonInteraction, InteractionCollector, Message, User, ComponentType, ButtonBuilder, StringSelectMenuInteraction, ActionRowBuilder, GuildMember, ChatInputCommandInteraction, APIEmbed, JSONEncodable } from "discord.js";
import { getClient } from "../constants/func";
import { delete_button } from "../constants/func";

export class Paginator {
  user: User;
  message: Message | undefined;
  initial: APIEmbed | JSONEncodable<APIEmbed>;
  indefinite: boolean;
  pages: any;
  interaction?: ButtonInteraction | ChatInputCommandInteraction | StringSelectMenuInteraction;
  p: number | undefined;

  constructor (user: User, initial: APIEmbed, pages: any, indefinite: boolean, message?: Message, interaction?: ButtonInteraction | ChatInputCommandInteraction | StringSelectMenuInteraction, p?: number | undefined) {
    this.user = user;
    this.message = message || undefined;
    this.initial = initial;
    this.indefinite = indefinite;
    this.pages = pages;
    this.interaction = interaction || undefined;
    this.p = p || undefined;
  }

  async _new () {
    
    if (!this.message && !this.interaction) return;

    console.log(this.message);
    console.log(this.interaction);

    let m = this.message?.member ? this.message!.member : this.interaction?.member; 
    

    console.log(m)


    if (!m) return;

    let deleteButton = await delete_button(m as GuildMember);

    const buttons: Array<ActionRowBuilder<ButtonBuilder>> = [
      deleteButton = deleteButton.addComponents(
        new ButtonBuilder({ customId: `Previous`, label: "Prev.", style: 1}), 
        new ButtonBuilder({ customId: `Next`, label: "Next.", style: 1}),
      ),
    ];

    if (!this.interaction) {
      if (!this.message) return;
      this.message = await this.message.channel.send({ content: "‎‎‎", embeds: [this.initial], components: buttons }).catch((err: any) => {
        console.log("Something went wrong: " + err)
      }) as Message;
      this.p = 0;
    } else {
      await this.interaction.reply({ content: "‎‎‎", embeds: [typeof this.p === "undefined" ? this.initial : this.pages[this.p]], components: buttons}).catch((err: any) => {
        console.log("Something went wrong: asdasdasdasdasd" + err)
      });
      this.message = await this.interaction.fetchReply() as Message;
      this.p === undefined ? this.p = 0 : this.p = this.p;
    }
    const filter = (interaction: ButtonInteraction) => interaction.isButton() && interaction.user.id != (<User>getClient().user).id;
    const paginator: InteractionCollector<ButtonInteraction> = this.message.createMessageComponentCollector({filter, time: 600000, componentType: ComponentType.Button});

    const id = this.user.id;
    paginator.on('collect', async i => {
      if (["Previous", "Next"].includes(i.customId)) { 
        if (id === i.user.id) this.page(i);
        else new Paginator(i.user as User, this.pages[this.p ? this.p : 0], this.pages, this.indefinite, undefined, i, this.p ? this.p : 0)._new();
      }
    });
    
    paginator.on("end", async (i, reason) => {
      if (reason === "time" && this.indefinite) {
        let deleteButton = await delete_button((<Message>this.message).member as GuildMember ?? (<ButtonInteraction | ChatInputCommandInteraction | StringSelectMenuInteraction>this.interaction).member);

        const buttons: Array<ActionRowBuilder<ButtonBuilder>> = [
          deleteButton = deleteButton.addComponents(
            new ButtonBuilder({ customId: `PREVIOUS_O`, label: `Prev.`, style: 1}),
            new ButtonBuilder({ customId: `NEXT_O`, label: "Next.", style: 1})
            )
        ];

        this.message ? this.message.edit({components: buttons}).catch((e)=>{console.log(e)}) : console.log("ummm, message deleted ig");
      }
    });
  }

  async page (i: ButtonInteraction) {   
    let ACTION: string = i.customId; 

    if (this.p === 0 && ACTION === "Previous" || (this.p === this.pages.length - 1 && ACTION === "Next")) {
      this.p = (ACTION == "Previous" ? this.pages.length : -1);
    }
    this.p = ACTION === "Previous" ? <number>this.p - 1 : <number>this.p + 1;
    
    await i.update({embeds: [this.pages[this.p]]}).catch((err: any) => console.log("Something went wrong: " + err));
  }
} 

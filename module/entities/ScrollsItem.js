 export default class ScrollsItem extends Item {
    prepareData() {
      super.prepareData();
    }
  
    async roll() {
      // Basic template rendering data
      const token = this.actor.token;
      const item = this.data;
      const actorData = this.actor ? this.actor.data.data : {};
      const itemData = item.data;
  
      let roll = new Roll('d20+@abilities.str.mod', actorData);
      let label = `Rolling ${item.name}`;
      roll.roll().toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label
      });
    }
  }
  
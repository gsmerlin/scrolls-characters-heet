export default class ScrollsCharacterSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 530,
      height: 700,
      classes: ["scrolls", "sheet", "character"],
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "description",
        },
      ],
    });
  }

  get template() {
    return `systems/scrolls/templates/sheets/character-sheet.html`;
  }

  getData() {
    const sheetData = super.getData();
    const data = sheetData.data;

    // Prepare items.
    this._prepareCharacterItems(sheetData);

    sheetData.data = data;
    return sheetData;
  }

  _prepareCharacterItems(sheetData) {
    const actorData = sheetData.actor;

    // Initialize containers.
    const gear = [];
    const skills = [];
    const techniques = [];

    // Iterate through items, allocating to containers
    // let totalWeight = 0;
    for (let i of sheetData.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      switch (i.type) {
        default: {
          // Either a weapon, armor or misc. Appends to gear.
          gear.push(i);
          break;
        }
        case "Skill": {
          skills.push(i);
          break;
        }
        case "Technique": {
          techniques.push(i);
          break;
        }
      }
    }

    // Assign and return
    actorData.gear = gear;
    actorData.skills = skills;
    actorData.techniques = techniques;
    actorData.isGM = game.user.isGM;

    actorData.skills.sort((a, b) => {
      if (a.data.level > b.data.level) {
        return -1;
      }
      if (a.data.level < b.data.level) {
        return 1;
      }
      return 0;
    });
    actorData.techniques.sort((a, b) => {
      if (a.data.level > b.data.level) {
        return -1;
      }
      if (a.data.level < b.data.level) {
        return 1;
      }
      return 0;
    });
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (!this.options.editable) return;
    html.find(".rollable").click(this._onRoll.bind(this));

    // Add Inventory Item
    html.find(".object-create").click(this._onObjectCreate.bind(this));

    // Update Inventory object
    html.find(".object-view").click((ev) => {
      const object = this.actor.items.get(ev.target.dataset.objectId);
      object.sheet.render(true);
    });

    // Delete Inventory object
    html.find(".object-delete").click((ev) => {
      this.actor.deleteOwnedItem(ev.target.dataset.objectId);
      this.render(true);
    });

    html.find(".object-levelup").click(this._onSkillLevelUp.bind(this));

    html.find(".macro").each((i, tr) => {
      tr.addEventListener("dragstart", (ev) => this._onDragStart(ev), false);
    });
  }

  _onSkillLevelUp(event) {
    console.log(event.target.dataset.objectId);
    const skill = this.actor.items.get(event.target.dataset.objectId);
    console.log(skill);
    console.log(this.actor);
    if (!skill.data.data.rolled) {
      return ui.notifications.warn(
        `${skill.data.name} has not been rolled yet and cannot be leveled up!`
      );
    }
    if (this.actor.data.data.exp < 2) {
      return ui.notifications.warn(
        `${this.actor.data.name} does not have enough experience to level up ${skill.data.name}!`
      );
    }
    const exp = this.actor.data.data.exp - 2;
    this.actor.update({
      "data.exp": exp,
    });
    console.log(skill.data.data);
    const level = skill.data.data.level + 1;
    const skillExp = skill.data.data.exp + 2;
    this.actor.updateEmbeddedDocuments("Item", [
      {
        _id: skill.id,
        "data.level": level,
        "data.rolled": false,
        "data.exp": skillExp,
      },
    ]);
  }

  _onDragStart(event) {
    if (event.target.classList.contains("entity-link")) return;

    // Create drag data
    const dragData = {
      actorId: this.actor.id,
    };

    const item = this.actor.items.get(event.target.id);
    console.log(item);
    if (item) {
      // Skill, Technique or Item
      dragData.type = item.data.type;
      dragData.data = item.data;
      // Set data transfer
      return event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
    }

    dragData.type = "Attribute";
    switch (event.target.id) {
      default: {
        // Physical
        dragData.name = "phy";
        dragData.data = this.actor.data.data.attributes.phy;
        break;
      }
      case "men": {
        // Mental
        dragData.name = "men";
        dragData.data = this.actor.data.data.attributes.men;
        break;
      }
      case "soc": {
        // Social
        dragData.name = "soc";
        dragData.data = this.actor.data.data.attributes.soc;
        break;
      }
    }
    // Set data transfer
    return event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  }

  /* -------------------------------------------- */

  async _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    switch (dataset.type) {
      default: {
        // Attribute roll
        const roll = new Roll(dataset.roll, this.actor.data.data);
        const label = dataset.label ? `Rolling ${dataset.label}` : "";
        roll.toMessage({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          flavor: label,
        });
        break;
      }
      case "Skill": {
        game.scrolls.rollSkillMacro(this.actor.id, dataset.id);
        break;
      }
      case "Technique": {
        game.scrolls.rollTechniqueMacro(this.actor.id, dataset.id);
        break;
      }
    }
  }

  _onObjectCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      data: data,
    };

    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return this.actor.createOwnedItem(itemData);
  }
}

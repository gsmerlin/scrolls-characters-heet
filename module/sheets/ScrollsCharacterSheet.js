export default class ScrollsCharacterSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 700,
      height: 600,
      classes: ["scrolls", "sheet", "player"],
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
    return `systems/scrolls/templates/sheets/characters/${this.actor.data.type}-sheet.html`;
  }

  getData() {
    const data = super.getData();
    data.dtypes = ["String", "Number", "Boolean"];
    for (let attr of Object.values(data.data.attributes)) {
      attr.isCheckbox = attr.dtype === "Boolean";
    }

    console.log(this.actor.data.type);
    // Prepare items.
    if (this.actor.data.type == "Player") {
      this._prepareCharacterItems(data);
    }

    return data;
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
      let item = i.data;
      console.log(i.type);
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
    console.log(actorData);
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (!this.options.editable) return;
    html.find(".rollable").click(this._onRoll.bind(this));

    // Add Inventory Item
    html.find(".object-create").click(this._onObjectCreate.bind(this));

    // Update Inventory object
    html.find(".object-edit").click((ev) => {
      const li = $(ev.currentTarget).parents(".object");
      console.log(li);
      console.log(ev.currentTarget);
      const object = this.actor.getOwnedItem(li.data("objectId"));
      object.sheet.render(true);
    });

    // Delete Inventory object
    html.find(".object-delete").click((ev) => {
      const li = $(ev.currentTarget).parents(".object");
      this.actor.deleteOwnedItem(li.data("objectId"));
      li.slideUp(200, () => this.render(false));
    });

    // Drag events for macros.
    if (this.actor.owner) {
      let handler = (ev) => this._onDragStart(ev);
      html.find("li.object").each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;
    switch (dataset.type) {
      default: {
        // Attribute roll
        const roll = new Roll(dataset.roll, this.actor.data.data);
        console.log(dataset);
        const label = dataset.label ? `Rolling ${dataset.label}` : "";
        roll.roll().toMessage({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          flavor: label,
        });
        this.actor.update({
          [`data.attributes.${dataset.label}.rolled`]: true,
        });
        break;
      }
      case "Skill": {
        const skill = this.actor.data.items.find(
          (item) => item._id == dataset.id
        );
        const rollString = `1d20 + ${skill.data.level} + ${skill.data.mod}`;
        const roll = new Roll(rollString);
        roll.roll().toMessage({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          flavor: skill.name,
        });
        console.log(rollString);
        console.log(skill);
        skill.rolled = true;
        this.actor.updateEmbeddedEntity("OwnedItem", {
          _id: skill._id,
          "data.rolled": true,
        });
        break;
      }
      case "Technique": {
        const technique = this.actor.data.items.find(
          (item) => item._id == dataset.id
        );
        const parentSkill = this.actor.data.items.find((item) => item.name.toLowerCase() === technique.data.parentSkill.toLowerCase());
        const rollString = `1d20 + ${parentSkill.data.level} + ${parentSkill.data.mod} + ${technique.data.mod}`;
        const roll = new Roll(rollString);
        roll.roll().toMessage({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          flavor: technique.name,
        });
        parentSkill.rolled = true;
        this.actor.updateEmbeddedEntity("OwnedItem", {
          _id: parentSkill._id,
          "data.rolled": true,
        });
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

    console.log(itemData);
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.data["type"];

    // Finally, create the item!
    return this.actor.createOwnedItem(itemData);
  }
}

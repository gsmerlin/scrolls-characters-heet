import { scrolls } from "./module/config.js";
import ScrollsItemSheet from "./module/sheets/ScrollsItemSheet.js";
import ScrollsCharacterSheet from "./module/sheets/ScrollsCharacterSheet.js";
import ScrollsCharacter from "./module/entities/ScrollsCharacter.js";
import ScrollsItem from "./module/entities/ScrollsItem.js";
import { createMacro, rollSkillMacro, rollAttributeMacro, rollTechniqueMacro } from "./utils.js";

Hooks.once("init", function () {
  console.log("Scrolls | Initializing Scrolls of <Placeholder> system");

  game.scrolls = {
    ScrollsCharacter,
    ScrollsItem,
    rollSkillMacro,
    rollAttributeMacro,
    rollTechniqueMacro,
  };

  CONFIG.scrolls = scrolls;
  CONFIG.Actor.documentClass = ScrollsCharacter;
  CONFIG.Item.documentClass = ScrollsItem;
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("scrolls", ScrollsItemSheet, { makeDefault: true });
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("scrolls", ScrollsCharacterSheet, { makeDefault: true });
});

Hooks.on("hotbarDrop", (bar, data, slot) => createMacro(data, slot));

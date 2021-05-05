import { scrolls } from './module/config.js';
import ScrollsItemSheet from "./module/sheets/ScrollsItemSheet.js";
import ScrollsCharacterSheet from "./module/sheets/ScrollsCharacterSheet.js";
import ScrollsCharacter from './module/entities/ScrollsCharacter.js';

Hooks.once("init", function() {
  console.log("Scrolls | Initializing Scrolls of <Placeholder> system");
  CONFIG.scrolls = scrolls;
  CONFIG.Actor.entityClass = ScrollsCharacter;
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("scrolls", ScrollsItemSheet, { makeDefault: true });
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("scrolls", ScrollsCharacterSheet, { makeDefault: true });

});

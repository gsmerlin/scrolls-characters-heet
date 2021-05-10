import { calcWeight } from "../utils/calcWeight.js";
export default class ScrollsItemSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 400,
      height: 750,
      classes: ["scrolls", "sheet", "item"],
    });
  }

  get template() {
    return `systems/scrolls/templates/sheets/items/${this.item.data.type}-sheet.html`.toLowerCase();
  }

  getData() {
    const data = super.getData();

    data.config = CONFIG.scrolls;

    data.data.quantity = data.data.quantity ?? 1;
    data.data.weight = data.data.weightClass
      ? calcWeight(data.data.weightClass, data.data.quantity)
      : null;

    data.data.isGM = game.user.isGM;
    console.log(data);
    return data;  
  }

}

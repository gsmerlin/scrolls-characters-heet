export default class ScrollsCharacter extends Actor {
  prepareData() {
    super.prepareData();
    console.log("======== Preparing character data ========");
    this.data.data.tExp = 0;
    if (this.data.type === "Player") {
      for (let [key, attribute] of Object.entries(this.data.data.attributes)) {
        this.data.data.vigor.max += attribute.value;
        this.data.data.tExp += parseInt(attribute.exp);
        attribute.mod = attribute.mod ?? "+0";
        attribute.rolled = attribute.rolled ?? false;
      }
      console.log(this.data.items);
      this.data.items.forEach((item) => {
        if (item.type === "Skill" || item.type === "Technique") {
          this.data.data.tExp += item.data.exp;
        }
      })
    }
    console.log("======== Finished preparing character data ========");
  }
}

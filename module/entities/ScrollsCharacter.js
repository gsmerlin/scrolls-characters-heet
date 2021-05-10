export default class ScrollsCharacter extends Actor {
  parseValue(value) {
    if (!parseInt(value)) return 0;
    return value;
  }

  prepareData() {
    super.prepareData();
    console.log("======== Preparing character data ========");
    this.data.data.tExp = 0;
    this.data.data.vigor.value = this.parseValue(this.data.data.vigor.value);
    this.data.data.energy.value = this.parseValue(this.data.data.energy.value);
    this.data.data.barrier.value = this.parseValue(this.data.data.barrier.value);
    this.data.data.barrier.max = this.parseValue(this.data.data.barrier.max);
    this.data.data.armor = this.parseValue(this.data.data.armor);
    this.data.data.exp = this.parseValue(this.data.data.exp);

    console.log(this.data);
    for (let [key, attribute] of Object.entries(this.data.data.attributes)) {
      attribute.value = this.parseValue(attribute.value);
      attribute.mod = this.parseValue(attribute.mod);
      attribute.exp = this.parseValue(attribute.exp);
      this.data.data.vigor.max += this.data.type === 'Simple' ? attribute.value * 3: attribute.value;
      this.data.data.energy.max += attribute.value;
      this.data.data.tExp += parseInt(attribute.exp);
      attribute.mod = attribute.mod ?? "+0";
      attribute.rolled = attribute.rolled ?? false;
      console.log(this.data.items);
    }
    this.data.items.forEach((item) => {
      if (item.type === "Skill" || item.type === "Technique") {
        this.data.data.tExp += item.data.exp;
      }
    });

    if (this.data.data.vigor.value > this.data.data.vigor.max) this.data.data.vigor.value = this.data.data.vigor.max;
    if (this.data.data.energy.value > this.data.data.energy.max) this.data.data.energy.value = this.data.data.energy.max;

    console.log("======== Finished preparing character data ========");
  }
}

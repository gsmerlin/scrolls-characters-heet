export const createMacro = async (data, slot) => {
  const actor = game.actors.get(data.actorId);
  let macro;
  console.log(data);
  console.log(actor);
  switch (data.type) {
    default: {
      // Skill
      macro = await Macro.create({
        name: data.data.name,
        type: "script",
        img: data.data.img,
        command: `game.scrolls.rollSkillMacro("${data.actorId}", "${data.data._id}")`,
        flags: { "scrolls.skillMacro": true },
      });
      break;
    }
    case "Attribute": {
      macro = await Macro.create({
        name: data.data.name,
        type: "script",
        image: "icons/svg/degen.svg",
        command: `game.scrolls.rollAttributeMacro("${data.actorId}", "${data.name}", "${data.data.name}")`,
        flags: { "scrolls.attributeMacro": true },
      });
      break;
    }
    case "Technique": {
      macro = await Macro.create({
        name: data.data.name,
        type: "script",
        img: data.data.img,
        command: `game.scrolls.rollTechniqueMacro("${data.actorId}", "${data.data._id}")`,
        flags: { "scrolls.techniqueMacro": true },
      });
      break;
    }
  }

  game.user.assignHotbarMacro(macro, slot);
};

export const rollSkillMacro = (actorId, skillId) => {
  const actor = game.actors.get(actorId);
  const skill = actor.data.items.find((skill) => skill.id === skillId);
  const rollString = `1d20 + ${skill.data.data.level} + ${skill.data.data.mod}`;
  const roll = new Roll(rollString);
  roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: skill.data.name,
  });
  actor.updateEmbeddedDocuments("Item", [
    {
      _id: skill.id,
      data: {
        ...skill.data,
        rolled: true,
      },
    },
  ]);
};

export const rollAttributeMacro = (actorId, attributeKey, attributeName) => {
  const actor = game.actors.get(actorId);
  const rollString = `d20+@attributes.${attributeKey}.value+@attributes.${attributeKey}.mod`;
  const roll = new Roll(rollString, actor.data.data);
  const label = `Rolling ${attributeName}`;
  roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: label,
  });
};

export const rollTechniqueMacro = (actorId, techniqueId) => {
  const actor = game.actors.get(actorId);
  const technique = actor.data.items.find((item) => item.id == techniqueId);
  const energyCost = technique.data.data.cost;
  if (energyCost > actor.data.data.energy.value) {
    return ui.notifications.warn(
      `${actor.data.name} does not have enough energy to use ${technique.name}!`
    );
  }
  const newEn = actor.data.data.energy.value - energyCost;
  const parentSkill = actor.data.items.find(
    (item) =>
      item.name.toLowerCase() === technique.data.data.parentSkill.toLowerCase()
  );
  const rollString = `1d20 + ${parentSkill.data.data.level} + ${parentSkill.data.data.mod} + ${technique.data.data.mod}`;
  const roll = new Roll(rollString);
  roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: `Rolling ${technique.data.name}`,
  });

  actor.update({
    data: {
      ...actor.data,
      energy: {
        ...actor.data.energy,
        value: newEn,
      },
    },
  });

  actor.updateEmbeddedDocuments("Item", [
    {
      _id: parentSkill.id,
      data: {
        ...parentSkill.data,
        rolled: true,
      },
    },
  ]);
};

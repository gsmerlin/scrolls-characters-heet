export const createMacro = async (data, slot) => {
  const actor = game.actors.get(data.actorId);
  let macro;
  console.log(data);
  console.log(actor);
  switch (data.type) {
    default: {
      // Skill
      const skill = actor.skills.find((skill) => skill._id === data.data.id);
      macro = await Macro.create({
        name: skill.name,
        type: "script",
        img: skill.img,
        command: `game.scrolls.rollSkillMacro("${data.actorId}", "${skill._id}")`,
        flags: { "scrolls.skillMacro": true },
      });
      break;
    }
    case "Attribute": {
      macro = await Macro.create({
        name: data.data.name,
        type: "script",
        command: `game.scrolls.rollAttributeMacro("${data.actorId}", "${data.name}", "${data.data.name}")`,
        flags: { "scrolls.attributeMacro": true },
      });
      break;
    }
    case "Technique": {
      const technique = actor.techniques.find(
        (item) => item.id == data.data.id
      );
      console.log(technique);
      macro = await Macro.create({
        name: technique.name,
        type: "script",
        img: technique.img,
        command: `game.scrolls.rollTechniqueMacro("${data.actorId}", "${technique._id}")`,
        flags: { "scrolls.techniqueMacro": true },
      });
      break;
    }
  }

  game.user.assignHotbarMacro(macro, slot);
};

export const rollSkillMacro = (actorId, skillId) => {
  const actor = game.actors.get(actorId);
  const skill = actor.data.items.find((skill) => skill._id === skillId);
  const rollString = `1d20 + ${skill.data.data.level} + ${skill.data.data.mod}`;
  const roll = new Roll(rollString);
  roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: skill.data.name,
  });
  skill.data.data.rolled = true;
  actor.updateEmbeddedDocuments(
    "Item",
    [
      {
        _id: skill.id,
        ...skill,
        "data.rolled": true,
      },
    ],
    { render: true, renderSheet: true }
  );
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
  const parentSkill = actor.data.items.find(
    (item) =>
      item.name.toLowerCase() === technique.data.data.parentSkill.toLowerCase()
  );

  console.log(technique);
  console.log(parentSkill);
  const rollString = `1d20 + ${parentSkill.data.data.level} + ${parentSkill.data.data.mod} + ${technique.data.data.mod}`;
  const roll = new Roll(rollString);
  roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: `Rolling ${technique.data.name}`,
  });
  parentSkill.data.data.rolled = true;
  actor.updateEmbeddedDocuments("Item", [
    {
      _id: parentSkill.id,
      ...parentSkill,
      "data.rolled": true,
    },
  ]);
};

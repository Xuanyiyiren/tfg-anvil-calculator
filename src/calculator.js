const MAX_WORK_VALUE = 150;

const STEP_VALUES = {
  hit1: -3,
  hit2: -6,
  hit3: -9,
  draw: -15,
  punch: 2,
  bend: 7,
  upset: 13,
  shrink: 16
};

const STEP_ORDER = [
  "hit1",
  "hit2",
  "hit3",
  "draw",
  "punch",
  "bend",
  "upset",
  "shrink"
];

const PRIORITY_SLOT_INDEX = {
  last: 0,
  "second-last": 1,
  "third-last": 2
};

function preprocessInstructions(instructions) {
  if (instructions.length > 3) {
    return null;
  }

  const seen = new Set();
  const uniqueInstructions = instructions.filter((instruction) => {
    const key = `${instruction.action}:${instruction.priority}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });

  let last = null;
  let secondLast = null;
  let thirdLast = null;
  let notLast1 = null;
  let notLast2 = null;

  for (const instruction of uniqueInstructions) {
    switch (instruction.priority) {
      case "third-last":
        if (thirdLast !== null) {
          return null;
        }
        thirdLast = instruction;
        break;
      case "second-last":
        if (secondLast !== null) {
          return null;
        }
        secondLast = instruction;
        break;
      case "last":
        if (last !== null) {
          return null;
        }
        last = instruction;
        break;
      case "not-last":
        if (notLast1 === null) {
          notLast1 = instruction;
        } else if (notLast2 === null) {
          notLast2 = notLast1;
          notLast1 = instruction;
        } else {
          return null;
        }
        break;
      default:
        break;
    }
  }

  // A flexible rule is still satisfiable if one of its only two legal slots
  // can also satisfy it by using the same action type.
  const canShareEitherCandidate = (rule, candidate1, candidate2) => (
    rule === null ||
    candidate1 === null ||
    candidate2 === null ||
    rule.action === candidate1.action ||
    rule.action === candidate2.action
  );

  return canShareEitherCandidate(notLast1, secondLast, thirdLast) &&
    canShareEitherCandidate(secondLast, notLast1, notLast2) &&
    canShareEitherCandidate(thirdLast, notLast1, notLast2)
    ? uniqueInstructions
    : null;
}

function enumerateFinalActionVariants(instructions) {
  const slots = [null, null, null];

  instructions.forEach((instruction) => {
    const slotIndex = PRIORITY_SLOT_INDEX[instruction.priority];

    if (slotIndex !== undefined) {
      slots[slotIndex] = instruction;
    }
  });

  instructions.forEach((instruction) => {
    if (instruction.priority !== "not-last" && instruction.priority !== "any") {
      return;
    }

    let placed = false;

    for (let index = 2; index >= 0; index -= 1) {
      if (
        slots[index] !== null &&
        slots[index].action === instruction.action &&
        (instruction.priority === "any" || index > 0)
      ) {
        slots[index] = instruction;
        placed = true;
        break;
      }
    }

    if (placed) {
      return;
    }

    for (let index = 2; index >= 0; index -= 1) {
      if (slots[index] === null) {
        slots[index] = instruction;
        break;
      }
    }
  });
  const variants = [];
  const current = [];

  function visit(slotIndex) {
    if (slotIndex < 0) {
      variants.push(
        current
          .filter((step) => step !== null)
      );
      return;
    }

    const instruction = slots[slotIndex];

    if (instruction === null) {
      current.push(null);
      visit(slotIndex - 1);
      current.pop();
      return;
    }

    expandInstructionAction(instruction).forEach((action) => {
      current.push({
        action,
        priority: instruction.priority
      });
      visit(slotIndex - 1);
      current.pop();
    });
  }

  visit(2);
  return variants;
}

function expandInstructionAction(instruction) {
  if (instruction.action === "hit") {
    return ["hit1", "hit2", "hit3"];
  }

  return [instruction.action];
}

function buildShortestPaths() {
  const distance = Array(MAX_WORK_VALUE + 1).fill(Infinity);
  const previous = Array(MAX_WORK_VALUE + 1).fill(null);
  const queue = [0];

  distance[0] = 0;

  for (let head = 0; head < queue.length; head += 1) {
    const value = queue[head];

    STEP_ORDER.forEach((action) => {
      const nextValue = value + STEP_VALUES[action];

      if (nextValue < 0 || nextValue > MAX_WORK_VALUE || distance[nextValue] !== Infinity) {
        return;
      }

      distance[nextValue] = distance[value] + 1;
      previous[nextValue] = { value, action };
      queue.push(nextValue);
    });
  }

  return { distance, previous };
}

const SHORTEST_PATHS = buildShortestPaths();

function recoverSetupActions(targetValue) {
  if (
    !Number.isInteger(targetValue) ||
    targetValue < 0 ||
    targetValue > MAX_WORK_VALUE ||
    SHORTEST_PATHS.distance[targetValue] === Infinity
  ) {
    return null;
  }

  const setupActions = [];
  let currentValue = targetValue;

  while (currentValue > 0) {
    const previousStep = SHORTEST_PATHS.previous[currentValue];

    if (previousStep === null) {
      return null;
    }

    setupActions.push(previousStep.action);
    currentValue = previousStep.value;
  }

  setupActions.reverse();
  return setupActions;
}

function isTailSequenceValid(startValue, finalInstructions, targetValue) {
  let currentValue = startValue;

  for (const instruction of finalInstructions) {
    currentValue += STEP_VALUES[instruction.action];

    if (currentValue < 0 || currentValue > MAX_WORK_VALUE) {
      return false;
    }
  }

  return currentValue === targetValue;
}

export function calculateResult(targetValue, instructions) {
  const processedInstructions = preprocessInstructions(instructions);

  if (processedInstructions === null) {
    return null;
  }

  const variants = enumerateFinalActionVariants(processedInstructions);

  let bestPlan = null;

  variants.forEach((finalInstructions) => {
    const finalSum = finalInstructions.reduce(
      (sum, instruction) => sum + STEP_VALUES[instruction.action],
      0
    );
    const setupTarget = targetValue - finalSum;

    if (!isTailSequenceValid(setupTarget, finalInstructions, targetValue)) {
      return;
    }

    const setupActions = recoverSetupActions(setupTarget);

    if (setupActions === null) {
      return;
    }

    const totalSteps = setupActions.length + finalInstructions.length;

    if (bestPlan === null || totalSteps < bestPlan.totalSteps) {
      bestPlan = {
        totalSteps,
        setupActions,
        finalInstructions
      };
    }
  });

  return bestPlan;
}

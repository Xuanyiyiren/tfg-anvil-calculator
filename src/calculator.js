const ACTION_VALUES = {
  punch: 2,
  bend: 7,
  upset: 13,
  shrink: 16,
  hit1: -3,
  hit2: -6,
  hit3: -9,
  draw: -15
};

function selectBestHit(targetValue, preTargetValue, remainingHits) {
  let bestHitAction = null;
  let minActions = Infinity;

  remainingHits.forEach((hit) => {
    const hitValue = ACTION_VALUES[hit];
    const actionsNeeded = Math.ceil(preTargetValue / hitValue);

    if (
      actionsNeeded < minActions &&
      (preTargetValue % hitValue === 0 || preTargetValue + hitValue <= targetValue)
    ) {
      minActions = actionsNeeded;
      bestHitAction = hit;
    }
  });

  return bestHitAction;
}

function calculateSetupActions(targetValue, instructions) {
  let instructionSum = 0;

  instructions.forEach((instruction) => {
    if (instruction.action === "hit") {
      const bestHit = selectBestHit(
        targetValue,
        targetValue - instructionSum,
        ["hit1", "hit2", "hit3"]
      );

      instructionSum += ACTION_VALUES[bestHit];
      instruction.action = bestHit;
      return;
    }

    instructionSum += ACTION_VALUES[instruction.action];
  });

  const preTargetValue = targetValue - instructionSum;
  const dp = Array(preTargetValue + 1).fill(Infinity);
  dp[0] = 0;

  for (let i = 0; i <= preTargetValue; i += 1) {
    if (dp[i] === Infinity) {
      continue;
    }

    for (const action in ACTION_VALUES) {
      const nextValue = i + ACTION_VALUES[action];

      if (nextValue <= preTargetValue) {
        dp[nextValue] = Math.min(dp[nextValue], dp[i] + 1);
      }
    }
  }

  const setupActions = [];
  let currentValue = preTargetValue;

  while (currentValue > 0) {
    for (const action in ACTION_VALUES) {
      const prevValue = currentValue - ACTION_VALUES[action];

      if (prevValue >= 0 && dp[prevValue] === dp[currentValue] - 1) {
        setupActions.push(action);
        currentValue = prevValue;
        break;
      }
    }
  }

  setupActions.reverse();

  return setupActions;
}

function sortInstructions(instructions) {
  const last = instructions.filter((instruction) => instruction.priority === "last");
  const secondLast = instructions.filter(
    (instruction) => instruction.priority === "second-last"
  );
  const thirdLast = instructions.filter(
    (instruction) => instruction.priority === "third-last"
  );
  const notLast = instructions.filter((instruction) => instruction.priority === "not-last");
  const anyPriority = instructions.filter((instruction) => instruction.priority === "any");

  const sortedInstructions = [...thirdLast, ...secondLast, ...notLast, ...last];

  if (anyPriority.length > 0) {
    const anyInstructions = anyPriority.map((instruction) => instruction);
    let insertionPoint = 0;

    if (last.length > 0 && secondLast.length > 0) {
      insertionPoint = sortedInstructions.length - last.length - secondLast.length;
    } else if (last.length > 0) {
      insertionPoint = sortedInstructions.length - last.length;
    } else {
      insertionPoint = sortedInstructions.length;
    }

    sortedInstructions.splice(insertionPoint, 0, ...anyInstructions);
  }

  return sortedInstructions;
}

export function calculateResults(targetValue, instructions) {
  const instructionSet = instructions.map((instruction) => ({ ...instruction }));

  return {
    setupActions: calculateSetupActions(targetValue, instructionSet),
    finalInstructions: sortInstructions(instructionSet)
  };
}

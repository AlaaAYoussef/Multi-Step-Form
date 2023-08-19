const router = require("express").Router();
const { User } = require("../../db/models");

const STEPS = [
  [
    {
      name: "firstName",
      label: "First Name",
      type: "text",
      required: true,
    },
    {
      name: "lastName",
      label: "Last Name",
      type: "text",
    },
    {
      name: "bio",
      label: "Bio",
      type: "multiline-text",
    },
  ],
  [
    {
      name: "country",
      label: "Country",
      type: "text",
      required: true,
    },
    {
      name: "receiveNotifications",
      label:
        "I would like to receive email notifications for new messages when I'm logged out",
      type: "yes-no",
      required: true,
    },
    {
      name: "receiveUpdates",
      label: "I would like to receive updates about the product via email",
      type: "yes-no",
      required: true,
    },
  ],
];

const isUndefinedOrNull = (item) => {
  return typeof item === 'undefined' || item === null
}

const methodNotAllowed = (req, res, next) => {
  return res.header("Allow", "GET").sendStatus(405);
};

const getOnboarding = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    return res.status(200).json({ steps: STEPS });
  } catch (error) {
    next(error);
  }
};

const isValidFieldName = (feildValue) => {

  const alphanumericRegex = /^[a-zA-Z0-9]+$/;

  if (typeof feildValue !== "string") {
    return false;
  }
  return alphanumericRegex.test(feildValue);

}

const isOnboardingDataSchemaValid = (payload) => {
  if (!payload.steps || !Array.isArray(payload.steps) || Object.keys(payload).length > 1) {
    return false
  }
  for (const step of payload.steps) {
    if (!Array.isArray(payload.steps)) {
      return false
    }
    for (const stepItem of step) {
      const keys = Object.keys(stepItem)

      if (keys.length !== 2) {
        return false
      }
      for (const key of keys) {
        if (!["name", "value"].includes(key)) {
          return false
        }
      }
    }
  }
  const fieldNames = STEPS.flatMap(step => step.map(field => field.name));
  const sentStepsNames = payload.steps.flatMap(step => step.map(field => field.name))
  for (const sentFieldName of sentStepsNames) {
    if (!fieldNames.includes(sentFieldName)) {
      return false;
    }
  }
  return true
}

const saveOnboardingDataSanitization = (req, res, next) => {
  if (!isOnboardingDataSchemaValid(req.body)) {
    return res.status(400).json({ error: "bad data" })
  }
  return next()
}
const validateOnboardingSteps = (steps) => {
  const preparedSteps = []
  for (const step of steps) {
    const preparedStep = step.reduce((acc, item) => {
      acc[item.name] = item.value
      return acc
    }, {})
    preparedSteps.push(preparedStep)
  }

  return STEPS.map((schemaStep, index) => {
    const step = preparedSteps[index]
    if (!step) {
      return `Missing Step Number ${index + 1}`
    }

    const stepErrors = schemaStep.map((schemaStepItem) => {
      const isRequired = schemaStepItem.required
      const value = step[schemaStepItem.name]
      const isValueExist = !isUndefinedOrNull(value)
      if (isRequired && !isValueExist) {
        return `${schemaStepItem.name} Is Missing`
      }

      if (!isValueExist) {
        return;
      }
      if (schemaStepItem.type === 'yes-no') {
        if (typeof value !== 'boolean') {
          return `${schemaStepItem.name} Is Not Boolean`
        }
        return;
      }
      if (typeof value !== 'string') {
        return `${schemaStepItem.name} Is Not String`
      }
    })
    return stepErrors.filter(Boolean).join(" , ")
  }).filter(Boolean).join(" , ")
}

const saveOnboarding = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "unauthorized" })
    }
    if (req.user.completedOnboarding) {
      return res.status(405).json({ error: "onboarding already completed" })
    }
    const validationError = validateOnboardingSteps(req.body.steps)
    if (validationError) {
      return res.status(400).json({ error: validationError })
    }
    const authenticatedUser = req.user
    const updateData = req.body.steps.reduce((parentAcc, step) => {
      const preparedStep = step.reduce((acc, item) => {
        acc[item.name] = item.value
        return acc
      }, {})
      return { ...preparedStep, ...parentAcc }

    }, {})
    updateData.completedOnboarding = true
    Object.assign(authenticatedUser, updateData)
    await authenticatedUser.save()
    const responsePayload = authenticatedUser.dataValues;
    delete responsePayload.password
    return res.status(200).json({ ...responsePayload });
  } catch (error) {
    next(error);
  }
};


router.route("/").get(getOnboarding).post(saveOnboardingDataSanitization, saveOnboarding).all(methodNotAllowed);

module.exports = router;

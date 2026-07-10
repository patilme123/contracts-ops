type ValidationError = {
  issues: Array<{
    message: string;
    path: Array<string | number>;
  }>;
};

export function formatValidationError(error: ValidationError) {
  const issue = error.issues[0];

  if (!issue) {
    return "Contract JSON failed validation.";
  }

  const field = issue.path.join(".");
  return field ? `${field}: ${issue.message}` : issue.message;
}

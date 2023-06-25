export class MissingVariableError extends Error {
  public readonly missingVariableName: string;

  constructor(error: ReferenceError) {
    super(error.toString());

    // Not sure about the \w, might need to be changed.
    const matchResult = error.message.match(/(\w+) is not defined/);

    if (!matchResult?.[1]) {
      throw error;
    }

    this.missingVariableName = matchResult[1];

    Error.captureStackTrace(this, MissingVariableError);
  }
}

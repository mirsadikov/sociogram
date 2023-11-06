class CustomError extends Error {
  constructor(message, status, info) {
    super(message);

    this.status = status;
    this.info = info || undefined;
  }
}

export default CustomError;
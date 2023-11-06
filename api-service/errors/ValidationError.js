import CustomError from './CustomError.js';

class ValidationError extends CustomError {
  constructor(errors) {
    const invalidFields = Object.keys(errors).join(', ');
    const message = `Invalid input for: ${invalidFields}`;
    
    super(message, 400, errors);
  }
}

export default ValidationError;
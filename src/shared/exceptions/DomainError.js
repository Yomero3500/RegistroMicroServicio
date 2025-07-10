class DomainError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

class ValidationError extends DomainError {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

class NotFoundError extends DomainError {
  constructor(message) {
    super(message);
    this.statusCode = 404;
  }
}

class DatabaseError extends DomainError {
  constructor(message) {
    super(message);
    this.statusCode = 500;
  }
}

module.exports = {
  DomainError,
  ValidationError,
  NotFoundError,
  DatabaseError
};
const { DomainError } = require('../../../shared/exceptions/DomainError');

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err instanceof DomainError) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message
    });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: 'Error al procesar el archivo'
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
}

module.exports = errorHandler;
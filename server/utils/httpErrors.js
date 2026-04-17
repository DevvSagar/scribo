export const createHttpError = (statusCode, publicMessage) => {
  const error = new Error(publicMessage);
  error.statusCode = statusCode;
  error.publicMessage = publicMessage;
  return error;
};

exports.jsonResponse = (res, jsonData, status = 200) => {
  res.status(status).json(jsonData);
};

exports.errorResponse = (res, error, status = 500) => {
  //TODO Extend function to support different status code
  //based on error type
  const errorResponse = {
    code: status,
    messages: error.message
  };

  try {
    res.status(status).json(errorResponse);
  } catch (error) {
    console.error(error);
  }
};

exports.succesResponse = (res, message, status = 200) => {
  const succesResponse = {
    code: status,
    messages: message
  }

  try {
    res.status(status).json(succesResponse);
  } catch (error) {
    console.log(error);
  }
};

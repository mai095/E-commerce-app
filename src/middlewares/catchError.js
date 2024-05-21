

const catchError = (controller) => {
  return (req, res, next) => {
    controller(req, res, next).catch((err) => next(err));
  };
};

export default catchError;

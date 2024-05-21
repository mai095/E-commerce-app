


const isAuthorized = (...role) => {
  return async(req, res, next) => {
    if (!role.includes(req.userData.role))
      return next(new Error("Not Authorized", { cause: 403 }));
    return next();
  };
};

export default isAuthorized;

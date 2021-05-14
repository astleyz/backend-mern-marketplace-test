export default (req, res, next) => {
  console.log(req.params);
  next();
};

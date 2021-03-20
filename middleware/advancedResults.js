const advancedResults = (model, populate) => async (req, res, next) => {
  let query;
  //compy req.query
  const reqQuery = { ...req.query };
  // console.log(reqQuery);
  //Fields to exclude
  const removeFields = [
    "select",
    "sort",
    "page",
    "limit",
    "minPrice",
    "maxPrice",
  ];
  //loop over remove fields and delete from req querry
  removeFields.forEach((param) => delete reqQuery[param]);
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );
  query = model.find(JSON.parse(queryStr)).populate("events");
  //set minimum price
  if (req.query.minPrice) {
    query = query.find({
      price: { $gt: req.query.minPrice },
    });
  }
  if (req.query.maxPrice) {
    query = query.find({ price: { $lt: req.query.maxPrice } });
  }
  //Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }
  //sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }
  //Pagination
  page = parseInt(req.query.page, 10) || 1;
  limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();
  query = query.skip(startIndex).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }
  //executing query
  const results = await query;
  //Pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }
  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };
  next();
};

module.exports = advancedResults;

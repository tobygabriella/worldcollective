const buildFilters = (params, query) => {
  const filters = {
    ...params,
    ...(query.category && { category: query.category }),
    ...(query.subcategory && { subcategory: query.subcategory }),
    ...(query.brand && { brand: query.brand }),
    ...(query.condition && { condition: query.condition }),
    ...(query.maxPrice && { price: { lte: parseFloat(query.maxPrice) } }),
  };
  return filters;
};

module.exports = { buildFilters };

// Shared list query for admin screens (orders, contact queries, media).
export const getPaginatedData = async (model: any, queryObj: Record<string, any>, options: Record<string, any> = {}) => {
  const { page = 1, limit = 10, searchString = "", isAllRecord = false, select = "", lean = false } = options;

  // only plain field names may be sorted on (no operators), whatever the browser sends
  const sortOn = /^[\w.]+$/.test(String(options.sortOn)) ? String(options.sortOn) : "createdAt";
  const sortDirection = String(options.sortDirection).toLowerCase() === "asc" ? "asc" : "desc";

  const currentPage = Math.max(1, parseInt(page) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit) || 10));

  let query = model.find(queryObj).sort({ [sortOn]: sortDirection === "asc" ? 1 : -1 });
  if (select) query = query.select(select);
  if (!isAllRecord) query = query.skip((currentPage - 1) * pageSize).limit(pageSize);
  if (lean) query = query.lean();

  const [totalCount, data] = await Promise.all([model.countDocuments(queryObj), query]);

  return {
    pagination: {
      totalCount,
      totalPages: isAllRecord ? 1 : Math.ceil(totalCount / pageSize),
      currentPage: isAllRecord ? 1 : currentPage,
      pageSize: isAllRecord ? totalCount : pageSize,
      sortOn,
      sortDirection,
      searchString,
      isAllRecord,
    },
    data,
  };
};

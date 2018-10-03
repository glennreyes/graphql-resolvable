// Bypasses resolver if all queried fields are whitelisted or resolved by the parent object
resolvable = (resolver, options = {}) => (parent, args, context, info) => {
  const { whitelist = [], returnArgs = false } = options;
  const res = parent ? parent[info.fieldName] : null;

  // Determine parent fields out of an array or object
  const parentFields = res
    ? Array.isArray(res) && res.length > 0
      ? Object.keys(res[0])
      : Object.keys(res)
    : [];
  const customFields = Array.isArray(whitelist) ? whitelist : [whitelist];
  const allFields = [...parentFields, ...customFields];
  // Dedupe
  const fields = allFields.filter(
    (field, index) => allFields.indexOf(field) === index,
  );
  const { selections } = info.fieldNodes[0].selectionSet;
  const queriedFields = selections.map(({ name: { value } }) => value);
  const shouldResolve = !queriedFields.every(queriedField =>
    fields.includes(queriedField),
  );

  const defaultResult = Array.isArray(res)
    ? res
    : // Args are only returned if return value is not an iterable
      { ...(returnArgs ? args : {}), ...res };

  return shouldResolve
    ? Promise.resolve(resolver(parent, args, context, info)).then(
        res =>
          Array.isArray(res)
            ? res
            : {
                ...defaultResult,
                ...res,
              },
      )
    : defaultResult;
};

export default resolvable;

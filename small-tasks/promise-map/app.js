Promise.map = function (items, callback) {
  const parseItems = (items) => {
    const promises = items.map(item => Promise.resolve(item));
    const result = [];

    for (item of items) {
      result.push(item.then(() => callback(item)));
    }

    return Promise.all(result);
  };

  return Promise.resolve(items)
    .then(parseItems);
}

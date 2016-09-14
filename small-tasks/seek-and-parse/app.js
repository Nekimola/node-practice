require('es6-promise').polyfill();
require('isomorphic-fetch');

const basePath = '//en.wikipedia.org';
const firstTerm = 'Microsoft';
const lastTerm = 'Nintendo';
const depth = 4;

let queue = [{
  name: firstTerm,
  depth: 0
}];

const resolve = null;
const reject = null;

const getTerms = (response, depth) => {
    const keys = Object.keys(response.query.pages);
    const htmlData = response.query.pages[keys[0]].revisions[0]['*'];
    let links = htmlData.match(/\/wiki\/([\w_\s\(\)\d]+)/g);

    return links.map(link => {
      return {
        name: link.split('/wiki/')[1],
        depth
      };
    });
};

const getData = () => {
  let term = queue.shift(),
      depth = ++term.depth;

  if (depth > 4) {
    return Promise.reject('Depth');
  }

  fetch(`${basePath}/w/api.php?format=json&action=query&prop=revisions&titles=${term.name}&rvprop=content&rvsection=0&rvparse`)
      .then(function(response) {
          if (response.status >= 400) {
              throw new Error("Bad response from server");
          }
          return response.json();
      })
      .then(data => getTerms(data, depth))
      .then(term => {
          [].push.apply(queue, terms);

          setTimeout(getData, 0);
      }) ;
};


const promise = new Promise((ok, bad) => {
  resolve = ok;
  reject = bad;

  getData();
});

promise.then(() => {
  console.log(queue);
});

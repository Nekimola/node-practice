require('es6-promise').polyfill();
require('isomorphic-fetch');

const firstTerm = 'Microsoft';
const lastTerm = 'Xbox';
const searchDepth = 4;

let path = [];

let queue = [{
    name: firstTerm,
    depth: 0
}];


const parseTerms = (response, depth) => {
    const keys = Object.keys(response.query.pages);
    const htmlData = response.query.pages[keys[0]].revisions && response.query.pages[keys[0]].revisions[0]['*'] || '';
    let links = htmlData.match(/\/wiki\/([\w_\s\(\)\d]+)/g) || [];
    let filteredLinks = [];

    links.forEach(link => {
        if (filteredLinks.indexOf(link) === -1 && link !== '/wiki/File') {
            filteredLinks.push(link)
        }
    });

    return filteredLinks.map(link => {
        return {
            name: link.split('/wiki/')[1],
            depth
        };
    });
};

const getData = () => {
    let term = queue.shift(),
        depth = term.depth + 1;

    path[term.depth] = term.name;

    if (depth > searchDepth) {
        return Promise.reject('Depth');
    }

    if (term.name === lastTerm) {
        return Promise.resolve();
    }

    return fetch(`//en.wikipedia.org/w/api.php?format=json&action=query&prop=revisions&titles=${term.name}&rvprop=content&rvsection=0&rvparse`)
        .then(response => response.json())
        .then(data => parseTerms(data, depth))
        .then(terms => {
            [].push.apply(queue, terms);
            console.log(path);
            return getData();
        });
};

getData()
    .then(() => {
        console.log('Final path: ', path);
    })
    .catch(error => {
        console.log(error);
    });


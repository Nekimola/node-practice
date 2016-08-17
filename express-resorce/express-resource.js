const express = require('express');
const router = express.Router();

module.exports = (entity) => {
    const setEntity = (req, res, next) => {
        if (typeof entity.load === 'function') {
            entity.load(req)
                .then(() => {
                    next();
                });
            return;
        }

        next();
    };

    router.get('/', function (req, res, next) {
        if (typeof entity.index === 'function') {
            entity.index(req, res);
        }

        next();
    });

    router.get('/:id', setEntity, (req, res, next) => {
        if (typeof entity.show === 'function') {
            entity.show(req, res);
        }

        next();
    });

    router.post('/', function (req, res, next) {
        if (typeof entity.create === 'function') {
            entity.create(req, res);
        }

        next();
    });

    router.put('/:id', setEntity, (req, res, next) => {
        if (typeof entity.update === 'function') {
            entity.update(req, res);
        }

        next();
    });

    router.delete('/:id', setEntity, (req, res, next) => {
        if (typeof entity.destroy === 'function') {
            entity.destroy(req, res);
        }

        next();
    });

    return router;
};


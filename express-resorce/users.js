module.exports = {
    index: (req, res) => {
        res.json({"message": 'Index'});
    },

    create: (req, res) => {

    },

    update: (req, res) => {
        res.json(req.entity);
    },

    destroy: (req, res) => {

    },

    show: (req, res) => {

    },

    load: (req, res) => {
        return new Promise(resolve => {
            req.entity = {'message': "It Works"};
            resolve();
        });
    }
};

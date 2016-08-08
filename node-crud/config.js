module.exports = {
    tokenSecret: 'yep',

    privateUrls: ['/auth/logout', '/user', '/users/import', '/users/export'],

    customValidators: {
        checkRole: function(value) {
            return ['admin', 'operator', 'user'].indexOf(value) !== -1;
        }
    },

    userValidators: {
        email: {
            notEmpty: true,
            isEmail: {
                errorMessage: 'Invalid Email'
            }
        },
        password: {
            notEmpty: true,
            isLength: {
                options: [{ min: 6 }],
                errorMessage: 'Must be more than 6 chars long'
            },
            errorMessage: 'Invalid Password'
        },
        name: {
            notEmpty: true,
            isLength: {
                options: [{ min: 1 }],
                errorMessage: 'Must be more than 1 char long'
            },
            errorMessage: 'Invalid Name'
        },
        name_ru: {
            notEmpty: true,
            isLength: {
                options: [{ min: 1 }],
                errorMessage: 'Must be more than 1 char long'
            },
            errorMessage: 'Invalid ru Name'
        },
        position: {
            optional: true
        },
        phone: {
            optional: true
        },
        role: {
            checkRole: true,
            errorMessage: 'Invalid role'
        },
        birthday: {
            notEmpty: true,
            isInt: true
        }
    }
};
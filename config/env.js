const paths = require('./paths');
const REACT_APP = /^REACT_APP_/i;

const raw = Object.keys(process.env)
    .filter(key => REACT_APP.test(key))
    .reduce(
        (env, key) => {
            env[key] = process.env[key];
            return env;
        },
        {
            NODE_ENV: process.env.NODE_ENV || 'development',
            PUBLIC_URL: paths.publicPath.slice(0, -1),
        }
    );

const stringified = {
    'process.env': Object.keys(raw).reduce((env, key) => {
        env[key] = JSON.stringify(raw[key]);
        return env;
    }, {}),
};

module.exports = {
    raw,
    stringified,
    publicPath: paths.publicPath,
};

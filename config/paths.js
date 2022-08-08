const path = require('path');
const fs = require('fs');

function getPublicUrlOrPath(isEnvDevelopment, envPublicUrl) {
    const stubDomain = 'https://create-react-app.dev';
    if (envPublicUrl) {
      // ensure last slash exists
      envPublicUrl = envPublicUrl.endsWith('/')
        ? envPublicUrl
        : envPublicUrl + '/';
      // validate if `envPublicUrl` is a URL or path like
      // `stubDomain` is ignored if `envPublicUrl` contains a domain
      const validPublicUrl = new URL(envPublicUrl, stubDomain);
      return isEnvDevelopment
        ? envPublicUrl.startsWith('.')
          ? '/'
          : validPublicUrl.pathname
        : // Some apps do not use client-side routing with pushState.
          // For these, "homepage" can be set to "." to enable relative asset paths.
          envPublicUrl;
    }
    return '/';
}

const appDirectory = fs.realpathSync(process.cwd());

const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const publicPath = getPublicUrlOrPath(process.env.NODE_ENV === 'development', process.env.PUBLIC_URL);

module.exports = {
  publicPath,
  appSrc: resolveApp('src'),
  appPath: resolveApp('.'),
};

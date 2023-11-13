import http from 'node:http';
import url from 'node:url';
import formidable from 'formidable';
import { FRONTEND_URL } from './config/secrets.js';

const methods = ['get', 'post', 'put', 'delete'];

class App {
  constructor() {
    this.routes = {
      middleware: [],
    };

    // to use it like app.get, app.post
    methods.forEach((method) => {
      this[method] = (path, ...handlers) => {
        const pathParts = path.split('/').map((part) => `/${part}`);

        pathParts.forEach((part, index) => {
          if (index === 0) return;

          this.routes.sub = this.routes.sub || {};
          this.routes.sub[part] = this.routes.sub[part] || { middleware: [] };

          if (index === pathParts.length - 1) {
            this.routes.sub[part].middleware = handlers.slice(0, handlers.length - 1);
            this.routes.sub[part][method] = handlers[handlers.length - 1];
          }
        });
      };
    });
  }

  use(...args) {
    const pathOrHandler = args[0];

    if (typeof pathOrHandler === 'string') {
      const path = pathOrHandler;
      const preMiddleware = args.slice(1, args.length - 1);
      const routerApp = args[args.length - 1];

      const subPaths = path.split('/').map((part) => `/${part}`);
      subPaths.shift();

      subPaths.forEach((part, index) => {
        this.routes.sub = this.routes.sub || {};
        this.routes.sub[part] = this.routes.sub[part] || { middleware: [] };

        if (index === subPaths.length - 1) {
          this.routes.sub[part].middleware = [...preMiddleware, ...routerApp.routes.middleware];
          this.routes.sub[part].sub = routerApp.routes.sub;
        }
      });
    } else if (typeof pathOrHandler === 'function') {
      const handler = pathOrHandler;
      this.routes.middleware.push(handler);
    }
  }

  listen(port, cb) {
    const defaultHandler = async (req, res) => {
      res.setHeader('Access-Control-Allow-Origin', FRONTEND_URL);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-auth-token');
      res.setHeader('Access-Control-Allow-Credentials', true);

      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
      }

      try {
        res.send = res.end;
        res.status = setStatus;
        res.cookie = setCookie;
        res.clearCookie = clearCookie;
        res.json = sendJson;

        const parsedUrl = url.parse(req.url, true);
        req.query = parsedUrl.query;
        const method = req.method.toLowerCase();
        const path = parsedUrl.pathname;
        const subPaths = path.split('/').map((part) => `/${part}`);
        subPaths.shift();
        if (subPaths[subPaths.length - 1] === '/' && subPaths.length > 1) subPaths.pop();

        const middlewares = [];

        let route = subPaths.reduce((route, part) => {
          if (!route || !route.sub) return;
          middlewares.push(...route.middleware);
          return route.sub[part];
        }, this.routes);

        if (route && !route[method] && route.sub) route = route.sub['/'];

        if (!route || !route[method]) {
          res.statusCode = 404;
          res.end('Not found');
          return;
        }

        middlewares.push(...route.middleware, route[method]);
        const handlers = middlewares.filter((m) => m.length !== 4);
        const errorHandlers = middlewares.filter((m) => m.length === 4);

        const next = async (error) => {
          if (error) {
            if (!errorHandlers.length) {
              defaultErrorHandler(error, req, res);
              return;
            }

            errorHandlers.forEach(async (handler) => await handler(error, req, res, next));

            return;
          }

          const handler = handlers.shift();
          if (!handler) return;

          if (handler.length === 4) {
            await next();
            return;
          }

          try {
            await handler(req, res, next);
          } catch (error) {
            await next(error);
          }
        };

        await next();
      } catch (error) {
        defaultErrorHandler(error, req, res);
      }
    };

    const server = http.createServer(defaultHandler);
    server.listen(port, cb);
  }
}

function myExpress() {
  return new App();
}

myExpress.Router = () => {
  return new App();
};

function defaultErrorHandler(error, req, res) {
  res.statusCode = 500;
  res.end(error.stack);
}

// static middlewares
myExpress.json = () => {
  return async function bodyParser(req, res, next) {
    req.body = {};
    const contentType = req.headers['content-type'];

    if (!contentType || !contentType.startsWith('application/json')) {
      next();
      return;
    }

    try {
      let data = '';

      req.on('data', (chunk) => {
        data += chunk.toString();
      });

      req.on('end', () => {
        req.body = JSON.parse(data);
        next();
      });
    } catch (error) {
      next(error);
    }
  };
};

myExpress.formdata = () => {
  return async function formdataParser(req, res, next) {
    const contentType = req.headers['content-type'];

    if (!contentType || !contentType.startsWith('multipart/form-data')) {
      next();
      return;
    }

    try {
      const form = formidable({});
      const [fields, files] = await form.parse(req);

      const reqBody = {};
      const reqFiles = {};

      // if value is multiple, it will be an array, else [0]
      Object.entries(fields).forEach(([key, value]) => {
        if (value.length > 1) {
          reqBody[key] = value;
          return;
        }

        reqBody[key] = value[0];
      });

      Object.entries(files).forEach(([key, value]) => {
        if (value.length > 1) {
          reqFiles[key] = value;
          return;
        }

        reqFiles[key] = value[0];
      });

      req.body = reqBody;
      req.files = reqFiles;
      next();
    } catch (error) {
      next(error);
    }
  };
};

// response methods
function setStatus(code) {
  this.statusCode = code;
  return this;
}

function setCookie(name, value, options) {
  let cookie = `${name}=${value};`;
  let path = '/';

  if (options) {
    if (options.httpOnly) cookie += ' HttpOnly;';
    if (options.maxAge) cookie += ` Max-Age=${options.maxAge / 1000};`;
    if (options.secure) cookie += ' Secure;';
    if (options.sameSite) cookie += ` SameSite=${options.sameSite};`;
    if (options.expires) cookie += ` Expires=${options.expires.toUTCString()};`;
    if (options.path) path = options.path;
  }

  cookie += ` Path=${path};`;

  this.setHeader('Set-Cookie', cookie);
  return this;
}

function clearCookie(name, options) {
  setCookie.call(this, name, '', { ...options, expires: new Date(0) });
  return this;
}

function sendJson(data) {
  this.setHeader('Content-Type', 'application/json; charset=utf-8');
  this.end(JSON.stringify(data));
}

export default myExpress;
export const Router = myExpress.Router;

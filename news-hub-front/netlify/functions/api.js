import serverless from 'serverless-http';
import appModule from '../../server/app.js';

const app = appModule?.default ?? appModule;
const serverlessHandler = serverless(app);

export const handler = async (event, context) => {
  // Netlify receives path like /.netlify/functions/api/api/news/top-headlines
  // Strip the function prefix so Express gets /api/news/top-headlines
  if (event.path && event.path.startsWith('/.netlify/functions/api')) {
    event.path = event.path.replace('/.netlify/functions/api', '') || '/';
  }
  return serverlessHandler(event, context);
};

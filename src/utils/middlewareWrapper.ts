import { NextApiRequest, NextApiResponse } from 'next';

export function middlewareWrapper(middleware: Function, handler: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    await new Promise((resolve, reject) => {
      middleware(req, res, (result: any) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });
    return handler(req, res);
  };
}

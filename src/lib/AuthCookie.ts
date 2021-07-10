import { IncomingMessage, ServerResponse } from 'http';
import Cookies from 'cookies';

import { AUTH_COOKIE_KEY, AUTH_COOKIE_SIGNED_SECRET } from './common';

export interface IAuthCookieContent {
  idToken: string;
  refreshToken: string;
}

export class AuthCookie {
  private key = AUTH_COOKIE_KEY;
  private instance: Cookies;

  constructor(req: IncomingMessage, res: ServerResponse) {
    this.instance = new Cookies(req, res, { keys: [AUTH_COOKIE_SIGNED_SECRET] });
  }

  get(): IAuthCookieContent {
    const raw = this.instance.get(this.key, { signed: true });
    return (raw ? JSON.parse(raw) : {}) as IAuthCookieContent;
  }

  set(data: any): void {
    if (!(data instanceof Object)) return;
    this.instance.set(this.key, JSON.stringify(data), {
      signed: true,
      overwrite: true,
      httpOnly: true,
      maxAge: 12 * 60 * 60 * 24 * 1000, // 12 days.
      sameSite: 'strict',
      secure: process.env.NODE_ENV == 'production',
    });
  }

  delete(): void {
    this.instance.set(this.key, undefined, { signed: true });
  }
}

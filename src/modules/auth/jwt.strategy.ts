import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // NOTE: Replace this with a real secret in production (e.g., process.env.JWT_SECRET)
      secretOrKey: 'my_super_secret_key', 
    });
  }

  async validate(payload: any) {
    // This payload is decoded from the JWT token
    // Returning this attaches it to `req.user` in your controllers
    return { sub: payload.sub, email: payload.email };
  }
}
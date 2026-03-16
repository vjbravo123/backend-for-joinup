import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';

// Make sure you initialize Firebase Admin in your main.ts or app.module.ts
// admin.initializeApp({ credential: admin.credential.cert(YOUR_SERVICE_ACCOUNT_JSON) });

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      // Attach the firebase user data to the request object
      request.user = decodedToken; 
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid Firebase Token');
    }
  }
}
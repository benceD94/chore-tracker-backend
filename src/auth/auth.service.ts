/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { UsersService } from '../users/users.service';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly usersService: UsersService,
  ) {}

  async validateToken(idToken: string): Promise<AuthResponseDto> {
    const decodedToken = await this.firebaseService.verifyIdToken(idToken);

    // Create or update user in PostgreSQL database
    await this.usersService.create({
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name,
      photoURL: decodedToken.picture,
    });

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified ?? false,
      displayName: decodedToken.name,
      photoURL: decodedToken.picture,
      phoneNumber: decodedToken.phone_number,
    };
  }

  async getCurrentUser(uid: string): Promise<AuthResponseDto> {
    const userRecord = await this.firebaseService.getUserByUid(uid);

    return {
      uid: userRecord.uid,
      email: userRecord.email,
      emailVerified: userRecord.emailVerified,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      phoneNumber: userRecord.phoneNumber,
    };
  }

  logout(): { message: string } {
    // Since we're using stateless JWT tokens,
    // logout is handled client-side by removing the token
    return { message: 'Logout successful' };
  }
}

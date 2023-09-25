import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'schemas/user.schema';
import { SignUpDto } from './dto/signup-dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Token } from './type/token-type';
import { SignInDto } from './dto/signin-dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<User>,
        private jwtService: JwtService
    ) { }

    async createToken(fullname: string, username: string): Promise<Token> {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                {
                    fullname,
                    username
                },
                {
                    expiresIn: "300s",
                    secret: process.env.ACCESS_TOKEN_SECRET
                }
            ),
            this.jwtService.signAsync(
                {
                    fullname,
                    username
                },
                {
                    expiresIn: "1h",
                    secret: process.env.REFRESH_TOKEN_SECRET
                }
            )
        ]);
        return {
            accessToken,
            refreshToken
        }
    }

    async signUp(signUpDto: SignUpDto): Promise<Token> {
        const { fullname, username, password } = signUpDto;
        const passwordHash = await bcrypt.hash(password, 10);
        const userData = await this.userModel.create({
            fullname,
            username,
            password: passwordHash
        });
        const token = await this.createToken(userData.fullname, userData.username);
        return token;
    }

    async signIn(signInDto: SignInDto): Promise<Token> {
        const { username, password } = signInDto;
        const userData = await this.userModel.findOne({ username });
        if (!userData) {
            throw new ForbiddenException("Access Denied");
        }
        const result = await bcrypt.compare(password, userData.password);
        if (!result) {
            throw new ForbiddenException("Access Denied");
        }
        const token = await this.createToken(userData.fullname, userData.username);
        return token;
    }

    async refreshToken(fullname: string, username: string): Promise<Token> {
        const token = await this.createToken(fullname, username);
        return token;
    }
}

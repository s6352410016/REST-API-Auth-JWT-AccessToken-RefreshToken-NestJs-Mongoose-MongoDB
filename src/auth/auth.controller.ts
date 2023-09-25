import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, Req } from '@nestjs/common';
import { SignUpDto } from './dto/signup-dto';
import { AuthService } from './auth.service';
import { Token } from './type/token-type';
import { SignInDto } from './dto/signin-dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post("signUp")
    signUp(@Body() signUpDto: SignUpDto): Promise<Token> {
        return this.authService.signUp(signUpDto);
    }

    @HttpCode(HttpStatus.OK)
    @Post("signIn")
    signIn(@Body() signInDto: SignInDto): Promise<Token> {
        return this.authService.signIn(signInDto);
    }

    @UseGuards(AuthGuard("jwt-access"))
    @HttpCode(HttpStatus.OK)
    @Post("authUser")
    authUser(@Req() req: Request): Express.User {
        return req.user;
    }

    @UseGuards(AuthGuard("jwt-refresh"))
    @HttpCode(HttpStatus.OK)
    @Post("refresh")
    refreshToken(@Req() req: Request): Promise<Token>{
        const user = req.user;
        return this.authService.refreshToken(user["fullname"] , user["username"]);
    }
}

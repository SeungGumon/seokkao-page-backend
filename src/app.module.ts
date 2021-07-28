import {User} from './user/entities/user.entity';
import {MiddlewareConsumer, Module, NestModule, RequestMethod} from '@nestjs/common';
import {UserModule} from './user/user.module';
import {GraphQLModule} from '@nestjs/graphql';
import {TypeOrmModule} from '@nestjs/typeorm';
import {ConfigModule} from '@nestjs/config';
import {CommonModule} from './common/common.module';
import {JwtModule} from './jwt/jwt.module';
import {JwtMiddleware} from "./jwt/jwt.middleware";


@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
            ignoreEnvFile: process.env.NODE_ENV === 'prod',
        }),
        GraphQLModule.forRoot({
            autoSchemaFile: true,
            context : ({req}) => ({user : req['user']})
        }),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST,
            port: +process.env.DB_PORT,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: 'seokkao-page',
            synchronize: true,
            logging: false,
            entities: [User],
        }),
        UserModule,
        CommonModule,
        JwtModule.forRoot({
            privateKey: process.env.SECRET_KEY
        }),
    ],
    providers: [],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(JwtMiddleware).forRoutes({
            path: "/graphql",
            method: RequestMethod.POST
        })
    }
}

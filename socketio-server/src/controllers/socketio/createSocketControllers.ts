import { SocketControllers } from 'socket-controllers';
import { Container } from 'typedi';

export const createSocketControllers = () => {
  return new SocketControllers({
    port: 3000,
    container: Container,
    controllers: [__dirname + '/controllers/**/*.ts'], // Sử dụng .ts nếu bạn sử dụng TypeScript
    // middlewares: [__dirname + '/middlewares/**/*.ts'], 
  });
};

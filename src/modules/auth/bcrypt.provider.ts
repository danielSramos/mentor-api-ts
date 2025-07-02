// src/modules/auth/bcrypt.provider.ts

import * as bcrypt from 'bcrypt'; // Importe o bcrypt real aqui
import { Provider } from '@nestjs/common';

export const BCRYPT_PROVIDER = 'BCRYPT'; // Um token de injeção para bcrypt

export const bcryptProvider: Provider = {
  provide: BCRYPT_PROVIDER, // Este é o token que você usará para injetar
  useValue: bcrypt,         // Fornece a instância completa do módulo bcrypt
  // Se você precisasse de configurações dinâmicas, usaria useFactory:
  // useFactory: () => {
  //   // Configurações, por exemplo, saltRounds
  //   // const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
  //   // return new BcryptService(saltRounds); // Se BcryptService fosse uma classe wrapper
  //   return bcrypt;
  // },
};
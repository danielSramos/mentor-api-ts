import * as bcrypt from 'bcrypt';
import { Provider } from '@nestjs/common';

export const BCRYPT_PROVIDER = 'BCRYPT';

export const bcryptProvider: Provider = {
  provide: BCRYPT_PROVIDER,
  useValue: bcrypt,
};
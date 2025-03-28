import { AccountEntity } from './accounts.entity';

export class AccountsMapper {
  static toDto(account: AccountEntity) {
    const { id, email, name, createdAt, updatedAt } = account.toJson();

    return { id, email, name, createdAt, updatedAt };
  }
}

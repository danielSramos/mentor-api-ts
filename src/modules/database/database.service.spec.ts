import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service';
import { PrismaClient } from '@prisma/client';

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseService],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should connect to the database on module init', async () => {
    // Mock do método $connect do PrismaClient
    service.$connect = jest.fn().mockResolvedValue(undefined);

    await service.onModuleInit();

    expect(service.$connect).toHaveBeenCalledTimes(1);
  });

  // Você pode adicionar mais testes se houver lógica adicional no DatabaseService,
  // mas para o que foi fornecido, o teste de conexão é o mais relevante.
});
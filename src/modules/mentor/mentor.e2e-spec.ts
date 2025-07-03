import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { AppModule } from 'src/app.module';
import { DatabaseService } from 'src/modules/database/database.service';
import { LoggerService } from 'src/modules/logger/logger.service';
import * as request from 'supertest';

describe('Mentors (e2e)', () => {
  let app: INestApplication;
  let databaseService: DatabaseService;
  const mentorProfileId = '2e8825ad-7f43-415b-acad-580a8314fd00';
  const clientProfileId = 'some-other-profile-id-client';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(LoggerService)
      .useValue({
        info: jest.fn(),
        error: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    databaseService = moduleFixture.get<DatabaseService>(DatabaseService);
  });

  beforeEach(async () => {
    await databaseService.skills.deleteMany();
    await databaseService.userProfiles.deleteMany();
    await databaseService.reviews.deleteMany();
    await databaseService.mentoringPlans.deleteMany();
    await databaseService.mentoringClients.deleteMany();
    await databaseService.mentoringStatuses.deleteMany();
    await databaseService.mentorings.deleteMany();
    await databaseService.userPhoneNumbers.deleteMany();
    await databaseService.users.deleteMany();
    await databaseService.knowledgeAreas.deleteMany();
    await databaseService.profiles.deleteMany();
    await databaseService.phoneNumbers.deleteMany();
    await databaseService.permissions.deleteMany();

    await databaseService.profiles.upsert({
      where: { id: mentorProfileId },
      update: { profile_name: 'MENTOR' },
      create: { id: mentorProfileId, profile_name: 'MENTOR' }
    });
    await databaseService.profiles.upsert({
      where: { id: clientProfileId },
      update: { profile_name: 'CLIENT' },
      create: { id: clientProfileId, profile_name: 'CLIENT' }
    });
  });

  afterAll(async () => {
    await databaseService.$disconnect();
    await app.close();
  });

  it('/mentors (GET) - should return all mentors', async () => {
    const hashedPassword = await bcrypt.hash('mentorpass', 10);
    const mentorId = randomUUID();
    await databaseService.users.create({
      data: {
        id: mentorId,
        name: 'Test Mentor',
        email: 'mentor@example.com',
        password: hashedPassword,
        user_profiles: {
          create: {
            id: randomUUID(),
            profiles: {
              connect: {
                id: mentorProfileId,
              },
            },
          },
        },
      },
    });

    const response = await request(app.getHttpServer())
      .get('/mentors')
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(response.body[0]).toHaveProperty('id', mentorId);
    expect(response.body[0]).toHaveProperty('name', 'Test Mentor');
    expect(response.body[0]).toHaveProperty('user_profiles');
    expect(response.body[0].user_profiles).toHaveProperty('profiles');
    expect(response.body[0].user_profiles.profiles).toHaveProperty('id', mentorProfileId);
    expect(response.body[0]).not.toHaveProperty('password');
  });

  it('/mentors/:mentorId (GET) - should return a mentor by ID', async () => {
    const hashedPassword = await bcrypt.hash('mentorpass', 10);
    const mentorId = randomUUID();
    await databaseService.users.create({
      data: {
        id: mentorId,
        name: 'Specific Mentor',
        email: 'specific@example.com',
        password: hashedPassword,
        user_profiles: {
          create: {
            id: randomUUID(),
            profiles: {
              connect: {
                id: mentorProfileId,
              },
            },
          },
        },
      },
    });

    const response = await request(app.getHttpServer())
      .get(`/mentors/${mentorId}`)
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.status).toBe(HttpStatus.OK);
    expect(response.body.content).toHaveProperty('id', mentorId);
    expect(response.body.content).toHaveProperty('name', 'Specific Mentor');
    expect(response.body.content).not.toHaveProperty('password');
  });

  it('/mentors/:mentorId (GET) - should return 404 if mentor not found', async () => {
    const nonExistentMentorId = randomUUID();

    const response = await request(app.getHttpServer())
      .get(`/mentors/${nonExistentMentorId}`)
      .expect(404);

    expect(response.body.message).toBe('Mentor not found');
  });

  it('/mentors/skills (GET) - should return all skills', async () => {
    const hashedPassword = await bcrypt.hash('mentorpass', 10);
    const mentorId = randomUUID();

    const knowledgeAreaIdForSkills = randomUUID();
    await databaseService.knowledgeAreas.create({
      data: { id: knowledgeAreaIdForSkills, name: 'Skills Area' },
    });


    await databaseService.users.create({
      data: {
        id: mentorId,
        name: 'Skillful Mentor',
        email: 'skillful@example.com',
        password: hashedPassword,
      },
    });

    await databaseService.userProfiles.create({
      data: {
        id: randomUUID(),
        profiles: {
          connect: { id: mentorProfileId }
        },
        users: {
          connect: { id: mentorId }
        }
      }
    });

    await databaseService.users.update({
      where: { id: mentorId },
      data: {
        skills: {
          create: [
            { id: randomUUID(), name: 'Node.js', fk_knowledge_area_id: knowledgeAreaIdForSkills },
            { id: randomUUID(), name: 'React', fk_knowledge_area_id: knowledgeAreaIdForSkills },
          ],
        },
      },
    });

    const response = await request(app.getHttpServer())
      .get('/mentors/skills')
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThanOrEqual(2);
    expect(response.body[0]).toHaveProperty('name');
    expect(response.body[0]).toHaveProperty('fk_knowledge_area_id');
  });

  it('/mentors/knowledgeAreas/list (GET) - should return all knowledge areas', async () => {
    const areaId1 = randomUUID();
    const areaId2 = randomUUID();
    await databaseService.knowledgeAreas.createMany({
      data: [
        { id: areaId1, name: 'Backend Development' },
        { id: areaId2, name: 'Frontend Development' },
      ],
    });

    const response = await request(app.getHttpServer())
      .get('/mentors/knowledgeAreas/list')
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThanOrEqual(2);
    expect(response.body[0]).toHaveProperty('name');
  });

  it('/mentors/:knowledgeAreaId/knowledgeAreas (GET) - should return mentors by knowledge area', async () => {
    const knowledgeAreaId = randomUUID();
    await databaseService.knowledgeAreas.create({
      data: { id: knowledgeAreaId, name: 'Database Management' },
    });

    const hashedPassword = await bcrypt.hash('mentorpass', 10);
    const mentorId = randomUUID();
    await databaseService.users.create({
      data: {
        id: mentorId,
        name: 'DB Mentor',
        email: 'dbmentor@example.com',
        password: hashedPassword,
        user_profiles: {
          create: {
            id: randomUUID(),
            profiles: {
              connect: {
                id: mentorProfileId,
              },
            },
          },
        },
        skills: {
          create: {
            id: randomUUID(),
            name: 'SQL',
            fk_knowledge_area_id: knowledgeAreaId,
          },
        },
      },
    });

    const response = await request(app.getHttpServer())
      .get(`/mentors/${knowledgeAreaId}/knowledgeAreas`)
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
    expect(response.body[0]).toHaveProperty('id', mentorId);
    expect(response.body[0]).toHaveProperty('skills');
    expect(response.body[0].skills[0]).toHaveProperty('knowledgeAreas');
    expect(response.body[0].skills[0].knowledgeAreas).toHaveProperty('id', knowledgeAreaId);
  });

  it('/mentors/:mentorId/createSkills (POST) - should add new skills to a mentor', async () => {
    const hashedPassword = await bcrypt.hash('mentorpass', 10);
    const mentorId = randomUUID();
    await databaseService.users.create({
      data: {
        id: mentorId,
        name: 'New Skill Mentor',
        email: 'newskill@example.com',
        password: hashedPassword,
        user_profiles: {
          create: {
            id: randomUUID(),
            profiles: {
              connect: {
                id: mentorProfileId,
              },
            },
          },
        },
      },
    });

    const knowledgeAreaId = randomUUID();
    await databaseService.knowledgeAreas.create({
      data: { id: knowledgeAreaId, name: 'Cloud Computing' },
    });

    const newSkillInput = {
      name: 'AWS',
      knowledgeAreaId: knowledgeAreaId,
    };

    const response = await request(app.getHttpServer())
      .post(`/mentors/${mentorId}/createSkills`)
      .send(newSkillInput)
      .expect(201);

    expect(response.body.status).toBe(HttpStatus.CREATED);
    expect(response.body.content).toBeDefined();
    expect(response.body.content.name).toBe('AWS');
    expect(response.body.content.fk_knowledge_area_id).toBe(knowledgeAreaId);

    const mentorWithSkills = await databaseService.users.findUnique({
      where: { id: mentorId },
      include: { skills: true },
    });
    expect(mentorWithSkills.skills.length).toBeGreaterThanOrEqual(1);
    expect(mentorWithSkills.skills[0]).toHaveProperty('name', 'AWS');
    expect(mentorWithSkills.skills[0]).toHaveProperty('fk_knowledge_area_id', knowledgeAreaId);
  });
});
-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "permission" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profile_name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "profile_permissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fk_profile_id" TEXT NOT NULL,
    "fk_permission_id" TEXT NOT NULL,
    CONSTRAINT "profile_permissions_fk_profile_id_fkey" FOREIGN KEY ("fk_profile_id") REFERENCES "profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "profile_permissions_fk_permission_id_fkey" FOREIGN KEY ("fk_permission_id") REFERENCES "permissions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password" TEXT NOT NULL,
    "company" TEXT,
    "position" TEXT,
    "nationality" TEXT,
    "verified" BOOLEAN,
    "description" TEXT,
    "profile_img_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fk_user_id" TEXT,
    "fk_profile_id" TEXT NOT NULL,
    CONSTRAINT "user_profiles_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "user_profiles_fk_profile_id_fkey" FOREIGN KEY ("fk_profile_id") REFERENCES "profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "phone_numbers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "user_phone_numbers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fk_user_id" TEXT NOT NULL,
    "fk_phone_number_id" TEXT NOT NULL,
    CONSTRAINT "user_phone_numbers_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_phone_numbers_fk_phone_number_id_fkey" FOREIGN KEY ("fk_phone_number_id") REFERENCES "phone_numbers" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "knowledge_areas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "fk_user_id" TEXT NOT NULL,
    "fk_knowledge_area_id" TEXT NOT NULL,
    CONSTRAINT "skills_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "skills_fk_knowledge_area_id_fkey" FOREIGN KEY ("fk_knowledge_area_id") REFERENCES "knowledge_areas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mentoring_plans" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cost" REAL NOT NULL,
    "duration" DATETIME NOT NULL,
    "fk_user_id" TEXT,
    CONSTRAINT "mentoring_plans_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mentorings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "fk_user_id" TEXT NOT NULL,
    CONSTRAINT "mentorings_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mentoring_clients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fk_user_id" TEXT,
    "fk_mentoring_id" TEXT,
    CONSTRAINT "mentoring_clients_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "mentoring_clients_fk_mentoring_id_fkey" FOREIGN KEY ("fk_mentoring_id") REFERENCES "mentorings" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mentoring_statuses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "fk_mentoring_id" TEXT,
    CONSTRAINT "mentoring_statuses_fk_mentoring_id_fkey" FOREIGN KEY ("fk_mentoring_id") REFERENCES "mentorings" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "fk_user_id" TEXT NOT NULL,
    CONSTRAINT "reviews_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_fk_user_id_key" ON "user_profiles"("fk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "mentoring_plans_fk_user_id_key" ON "mentoring_plans"("fk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "mentorings_fk_user_id_key" ON "mentorings"("fk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "mentoring_clients_fk_user_id_key" ON "mentoring_clients"("fk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "mentoring_clients_fk_mentoring_id_key" ON "mentoring_clients"("fk_mentoring_id");

-- CreateIndex
CREATE UNIQUE INDEX "mentoring_statuses_fk_mentoring_id_key" ON "mentoring_statuses"("fk_mentoring_id");

BEGIN;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "profileId" TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Profile'
      AND column_name = 'userId'
  ) THEN
    UPDATE "User" u
    SET
      "firstName" = COALESCE(NULLIF(u."firstName", ''), p."firstName", split_part(u.email, '@', 1)),
      "lastName" = COALESCE(NULLIF(u."lastName", ''), p."lastName", ''),
      phone = COALESCE(u.phone, p.phone),
      avatar = COALESCE(u.avatar, p.avatar),
      bio = COALESCE(u.bio, p.bio)
    FROM "Profile" p
    WHERE p."userId" = u.id;

    ALTER TABLE "Profile" RENAME TO "Profile_legacy";
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "Profile" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "Profile" (id, name, slug, description)
VALUES
  ('profile_superadmin', 'SUPERADMIN', 'superadmin', 'Acceso total al sistema y administración global.'),
  ('profile_admin', 'ADMIN', 'admin', 'Acceso administrativo para gestión operativa.'),
  ('profile_views', 'VIEWS', 'views', 'Acceso de consulta o visualización.')
ON CONFLICT (slug)
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  "updatedAt" = CURRENT_TIMESTAMP;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'User'
      AND column_name = 'role'
  ) THEN
    UPDATE "User"
    SET "profileId" = CASE
      WHEN email = 'admin@tienda.local' THEN 'profile_superadmin'
      WHEN role = 'ADMIN' THEN 'profile_admin'
      WHEN role = 'EDITOR' THEN 'profile_admin'
      ELSE 'profile_views'
    END
    WHERE "profileId" IS NULL;
  END IF;
END $$;

UPDATE "User"
SET
  "firstName" = COALESCE(NULLIF("firstName", ''), split_part(email, '@', 1)),
  "lastName" = COALESCE("lastName", ''),
  "profileId" = COALESCE("profileId", 'profile_views');

ALTER TABLE "User" ALTER COLUMN "firstName" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "lastName" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "profileId" SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'User_profileId_fkey'
  ) THEN
    ALTER TABLE "User"
    ADD CONSTRAINT "User_profileId_fkey"
    FOREIGN KEY ("profileId") REFERENCES "Profile"(id)
    ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "User" DROP COLUMN IF EXISTS role;
DROP TYPE IF EXISTS "UserRole";
DROP TABLE IF EXISTS "Profile_legacy";

COMMIT;

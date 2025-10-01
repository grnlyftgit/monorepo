import { pgEnum } from 'drizzle-orm/pg-core';

export const userRoles = pgEnum('userRoles', [
  // roles for main stream
  'SUPERADMIN',
  'ADMIN',

  // roles for company
  'EMPLOYEE',
  'SALES',
  'MANAGER',
  'INTERNAL',

  // roles for carpool
  'DRIVER',
  'PARENT',

  // roles for signed up users
  'USER',
]);

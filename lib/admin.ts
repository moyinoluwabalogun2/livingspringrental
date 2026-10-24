import {
  doc,
  getDoc,
} from 'firebase/firestore';

import type {
  User,
} from 'firebase/auth';

import {
  db,
} from '@/lib/firebase';

export type AdminRole =
  | 'owner'
  | 'admin';

export type AdminProfile = {
  uid: string;

  email: string;

  displayName: string;

  role:
    AdminRole;

  active: boolean;
};

function normaliseRole(
  value: unknown
):
  AdminRole | null {
  if (
    value ===
    'owner'
  ) {
    return 'owner';
  }

  if (
    value ===
    'admin'
  ) {
    return 'admin';
  }

  return null;
}

export async function getAdminProfile(
  user: User
):
  Promise<
    AdminProfile | null
  > {
  const reference =
    doc(
      db,
      'admins',
      user.uid
    );

  const snapshot =
    await getDoc(
      reference
    );

  if (
    !snapshot.exists()
  ) {
    return null;
  }

  const data =
    snapshot.data();

  if (
    data.active !==
    true
  ) {
    return null;
  }

  const role =
    normaliseRole(
      data.role
    );

  if (!role) {
    return null;
  }

  return {
    uid:
      user.uid,

    email:
      typeof data.email ===
      'string'
        ? data.email
        : user.email ||
          '',

    displayName:
      typeof data.displayName ===
      'string'
        ? data.displayName
        : 'Living Spring Administrator',

    role,

    active:
      true,
  };
}
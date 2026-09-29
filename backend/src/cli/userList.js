import 'dotenv/config';
import { listUsers, closeUsersDb } from '../auth/users.js';

try {
  const users = listUsers();

  if (users.length === 0) {
    console.log('No users exist yet.');
  } else {
    console.log('Users:');
    for (const user of users) {
      console.log(`  ${user.username}  (created: ${user.created_at}, last login: ${user.last_login_at ?? 'never'})`);
    }
  }
} catch (error) {
  console.error('Failed to list users:', error.message);
  process.exitCode = 1;
} finally {
  closeUsersDb();
}

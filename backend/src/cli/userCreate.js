import 'dotenv/config';
import readline from 'node:readline/promises';
import { createUser, userExists, closeUsersDb } from '../auth/users.js';

const MIN_PASSWORD_LENGTH = 8;
const USAGE = 'Usage: npm run user:create -- <username> <password>';

const KEY_ENTER = new Set(['\n', '\r']);
const KEY_EOF = '\u0004'; // Ctrl-D
const KEY_INTERRUPT = '\u0003'; // Ctrl-C
const KEY_BACKSPACE = new Set(['\u007f', '\b']);

// Reads a line from stdin without echoing it, so a password typed
// interactively (docker compose exec is a TTY by default) never ends up in
// shell history or `ps` output the way a command-line argument would.
function promptPassword(query) {
  return new Promise((resolve) => {
    process.stdout.write(query);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    let password = '';
    const onData = (char) => {
      if (KEY_ENTER.has(char) || char === KEY_EOF) {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener('data', onData);
        process.stdout.write('\n');
        resolve(password);
        return;
      }
      if (char === KEY_INTERRUPT) {
        process.stdout.write('\n');
        process.exit(130);
        return;
      }
      if (KEY_BACKSPACE.has(char)) {
        password = password.slice(0, -1);
        return;
      }
      password += char;
    };
    process.stdin.on('data', onData);
  });
}

// Plain (echoed) prompt, used for the username when both arguments are
// omitted.
async function promptUsername(query) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    return await rl.question(query);
  } finally {
    rl.close();
  }
}

async function main() {
  const [usernameArg, passwordArg] = process.argv.slice(2);
  const noArgsGiven = !usernameArg && !passwordArg;

  if (!noArgsGiven && (!usernameArg || !passwordArg)) {
    console.error(USAGE);
    console.error('Omit both arguments to be prompted for them interactively instead (password hidden).');
    process.exitCode = 1;
    return;
  }

  let username = usernameArg;
  let password = passwordArg;

  if (noArgsGiven) {
    if (!process.stdin.isTTY) {
      console.error(USAGE);
      console.error('No arguments given and stdin is not a terminal, so they cannot be prompted for.');
      process.exitCode = 1;
      return;
    }
    username = await promptUsername('Username: ');
    password = await promptPassword('Password: ');
  }

  if (!username || !password) {
    console.error(USAGE);
    process.exitCode = 1;
    return;
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    console.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
    process.exitCode = 1;
    return;
  }

  if (userExists(username)) {
    console.error(`A user named "${username}" already exists.`);
    process.exitCode = 1;
    return;
  }

  await createUser(username, password);
  console.log(`User created: ${username}`);
}

main()
  .catch((error) => {
    console.error('Failed to create user:', error.message);
    process.exitCode = 1;
  })
  .finally(() => closeUsersDb());

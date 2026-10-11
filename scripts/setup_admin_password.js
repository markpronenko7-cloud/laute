#!/usr/bin/env node
import readline from 'readline';
import { hashPassword } from '../server/securityService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AUTH_CONFIG_FILE = path.resolve(__dirname, '..', 'server', 'data', 'auth_config.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const argPassword = process.argv[2];

function applyPassword(rawPassword) {
  const clean = String(rawPassword || '').trim();
  if (clean.length < 6) {
    console.error('\n❌ Ошибка: Пароль должен быть длиной не менее 6 символов.');
    process.exit(1);
  }

  const { hash, salt } = hashPassword(clean);
  const data = {
    isInitialized: true,
    passwordHash: hash,
    salt: salt,
    algorithm: 'scrypt',
    updatedAt: new Date().toISOString()
  };

  const dir = path.dirname(AUTH_CONFIG_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(AUTH_CONFIG_FILE, JSON.stringify(data, null, 2), 'utf8');

  console.log('\n======================================================');
  console.log('✅ ПАРОЛЬ АДМИНИСТРАТОРА LAUTE УСПЕШНО УСТАНОВЛЕН!');
  console.log('======================================================');
  console.log('• Пароль надежно сохранен в виде криптографического scrypt-хеша с солью.');
  console.log('• Исходный пароль НЕ сохраняется в открытом виде.');
  console.log('• Теперь вы можете войти в панель управления на /admin.');
  console.log('======================================================\n');
  process.exit(0);
}

if (argPassword) {
  applyPassword(argPassword);
} else {
  console.log('\n======================================================');
  console.log('🔐 УСТАНОВКА / СМЕНА ПАРОЛЯ АДМИНИСТРАТОРА LAUTE');
  console.log('======================================================');
  rl.question('Введите новый пароль для доступа к панели управления: ', (answer) => {
    rl.close();
    applyPassword(answer);
  });
}

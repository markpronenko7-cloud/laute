import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const AUTH_CONFIG_FILE = path.resolve(DATA_DIR, 'auth_config.json');
const SESSIONS_FILE = path.resolve(DATA_DIR, 'sessions.json');

// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory rate limiting map: ip -> { failedAttempts: number, lockedUntil: number | null }
const rateLimitMap = new Map();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

// Read JSON helper
function readJson(filePath, defaultValue) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return defaultValue;
}

// Write JSON helper
function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

/**
 * Хеширование пароля с солью с использованием scrypt (Node.js crypto)
 */
export function hashPassword(password, salt = null) {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, generatedSalt, 64);
  return {
    hash: derivedKey.toString('hex'),
    salt: generatedSalt
  };
}

/**
 * Безопасное сравнение пароля с хешем (защита от timing attacks)
 */
export function verifyPasswordHash(password, storedHash, storedSalt) {
  try {
    const derivedKey = crypto.scryptSync(password, storedSalt, 64);
    const keyBuffer = Buffer.from(derivedKey.toString('hex'), 'hex');
    const hashBuffer = Buffer.from(storedHash, 'hex');
    if (keyBuffer.length !== hashBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(keyBuffer, hashBuffer);
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
}

/**
 * Инициализация конфигурации аутентификации.
 * Проверяет наличие process.env.ADMIN_PASSWORD или существующего auth_config.json.
 */
export function initAuthConfig() {
  let config = readJson(AUTH_CONFIG_FILE, null);

  // If env var is set, it can set or update the password securely
  const envPassword = process.env.ADMIN_PASSWORD;

  if (envPassword && envPassword.trim()) {
    const { hash, salt } = hashPassword(envPassword.trim());
    config = {
      isInitialized: true,
      passwordHash: hash,
      salt: salt,
      algorithm: 'scrypt',
      updatedAt: new Date().toISOString()
    };
    writeJson(AUTH_CONFIG_FILE, config);
    console.log('🔒 Пароль администратора LAUTE инициализирован из переменной окружения ADMIN_PASSWORD.');
    return config;
  }

  if (!config) {
    // Check if old users.json had admin password to migrate seamlessly
    const oldUsersFile = path.resolve(DATA_DIR, 'users.json');
    const oldUsers = readJson(oldUsersFile, []);
    const oldAdmin = oldUsers.find(u => u.role === 'admin' && u.password);

    if (oldAdmin && oldAdmin.password) {
      const { hash, salt } = hashPassword(oldAdmin.password);
      config = {
        isInitialized: true,
        passwordHash: hash,
        salt: salt,
        algorithm: 'scrypt',
        updatedAt: new Date().toISOString()
      };
      writeJson(AUTH_CONFIG_FILE, config);
      console.log('🔒 Учетная запись администратора LAUTE успешно мигрирована на защищённый scrypt-хеш.');
      // Remove sensitive plaintext passwords from users.json
      fs.unlinkSync(oldUsersFile);
    } else {
      // Uninitialized state - wait for setup
      config = {
        isInitialized: false,
        passwordHash: null,
        salt: null,
        algorithm: 'scrypt',
        updatedAt: null
      };
      writeJson(AUTH_CONFIG_FILE, config);
      console.log('⚠️ Пароль администратора LAUTE ещё не задан. Требуется первоначальная настройка.');
    }
  }

  return config;
}

/**
 * Проверка статуса инициализации пароля
 */
export function getAuthStatus() {
  const config = readJson(AUTH_CONFIG_FILE, null) || initAuthConfig();
  return {
    isInitialized: Boolean(config && config.isInitialized && config.passwordHash),
    updatedAt: config?.updatedAt || null
  };
}

/**
 * Установка первоначального пароля (только если еще не инициализирован)
 */
export function setInitialPassword(newPassword) {
  const config = readJson(AUTH_CONFIG_FILE, null) || initAuthConfig();
  if (config && config.isInitialized && config.passwordHash) {
    throw new Error('Пароль администратора уже установлен. Используйте процедуру смены пароля.');
  }

  if (!newPassword || newPassword.trim().length < 6) {
    throw new Error('Пароль должен содержать не менее 6 символов.');
  }

  const { hash, salt } = hashPassword(newPassword.trim());
  const newConfig = {
    isInitialized: true,
    passwordHash: hash,
    salt: salt,
    algorithm: 'scrypt',
    updatedAt: new Date().toISOString()
  };

  writeJson(AUTH_CONFIG_FILE, newConfig);
  return { success: true };
}

/**
 * Смена пароля администратора (требует подтверждения старого пароля)
 */
export function changeAdminPassword(oldPassword, newPassword) {
  const config = readJson(AUTH_CONFIG_FILE, null);
  if (!config || !config.isInitialized || !config.passwordHash) {
    throw new Error('Система авторизации не настроена.');
  }

  if (!verifyPasswordHash(oldPassword, config.passwordHash, config.salt)) {
    throw new Error('Неверный текущий пароль администратора.');
  }

  if (!newPassword || newPassword.trim().length < 6) {
    throw new Error('Новый пароль должен содержать не менее 6 символов.');
  }

  const { hash, salt } = hashPassword(newPassword.trim());
  config.passwordHash = hash;
  config.salt = salt;
  config.updatedAt = new Date().toISOString();

  writeJson(AUTH_CONFIG_FILE, config);

  // Invalidate all existing sessions on password change
  writeJson(SESSIONS_FILE, {});

  return { success: true };
}

/**
 * Проверка защиты от перебора (Rate Limiting)
 */
export function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    return { allowed: true };
  }

  if (record.lockedUntil && now < record.lockedUntil) {
    const remainingSec = Math.ceil((record.lockedUntil - now) / 1000);
    const remainingMin = Math.ceil(remainingSec / 60);
    return {
      allowed: false,
      message: `Слишком много неверных попыток входа. Доступ временно заблокирован на ${remainingMin} мин. Повторите попытку позже.`
    };
  }

  // Reset if window expired
  if (record.lastAttempt && (now - record.lastAttempt > ATTEMPT_WINDOW_MS)) {
    rateLimitMap.delete(ip);
    return { allowed: true };
  }

  return { allowed: true };
}

/**
 * Регистрация неудачной попытки входа
 */
export function recordFailedAttempt(ip) {
  const now = Date.now();
  let record = rateLimitMap.get(ip);

  if (!record) {
    record = { failedAttempts: 1, lastAttempt: now, lockedUntil: null };
  } else {
    record.failedAttempts += 1;
    record.lastAttempt = now;
  }

  if (record.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    console.warn(`[SECURITY] IP ${ip} заблокирован на 15 минут за ${MAX_FAILED_ATTEMPTS} неверных попыток ввода пароля.`);
  }

  rateLimitMap.set(ip, record);
}

/**
 * Сброс счетчика неудачных попыток при успешном входе
 */
export function resetRateLimit(ip) {
  rateLimitMap.delete(ip);
}

/**
 * Аутентификация по единственному паролю
 */
export function authenticateWithPassword(password, ip) {
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    return { success: false, error: rateLimit.message, status: 429 };
  }

  const config = readJson(AUTH_CONFIG_FILE, null) || initAuthConfig();

  if (!config || !config.isInitialized || !config.passwordHash) {
    return {
      success: false,
      error: 'Пароль ещё не задан при развёртывании. Требуется первоначальная настройка.',
      needsSetup: true,
      status: 400
    };
  }

  const isValid = verifyPasswordHash(password, config.passwordHash, config.salt);

  if (!isValid) {
    recordFailedAttempt(ip);
    return {
      success: false,
      error: 'Неверный пароль доступа к панели управления',
      status: 401
    };
  }

  // Password valid -> reset rate limit
  resetRateLimit(ip);

  // Generate cryptographically secure session token
  const token = 'laute_sess_' + crypto.randomBytes(32).toString('hex');
  const session = {
    sessionId: token.slice(0, 22),
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    ip: ip
  };

  const sessions = readJson(SESSIONS_FILE, {});
  sessions[token] = session;
  writeJson(SESSIONS_FILE, sessions);

  return {
    success: true,
    token,
    session: {
      id: session.sessionId,
      role: 'admin',
      title: 'Администратор LAUTE'
    }
  };
}

/**
 * Проверка валидности сессионного токена
 */
export function validateSessionToken(token) {
  if (!token) return null;
  const sessions = readJson(SESSIONS_FILE, {});
  const session = sessions[token];

  if (!session) return null;

  // Check expiration
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    delete sessions[token];
    writeJson(SESSIONS_FILE, sessions);
    return null;
  }

  return session;
}

/**
 * Завершение сессии (Logout)
 */
export function destroySession(token) {
  if (!token) return;
  const sessions = readJson(SESSIONS_FILE, {});
  if (sessions[token]) {
    delete sessions[token];
    writeJson(SESSIONS_FILE, sessions);
  }
}

/**
 * Создание защищённой dev-сессии для локальной разработки (без ввода пароля)
 * Вызывается ТОЛЬКО после строгой проверки локального IP и хоста
 */
export function createDevSession(ip = '127.0.0.1') {
  const token = 'laute_sess_dev_' + crypto.randomBytes(32).toString('hex');
  const session = {
    sessionId: token.slice(0, 22),
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    ip: ip,
    isDev: true
  };

  const sessions = readJson(SESSIONS_FILE, {});
  sessions[token] = session;
  writeJson(SESSIONS_FILE, sessions);

  return {
    success: true,
    token,
    session: {
      id: session.sessionId,
      role: 'admin',
      title: 'Сотрудник LAUTE (Локальный режим)',
      createdAt: session.createdAt
    }
  };
}


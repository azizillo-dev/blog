import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password || password.length < 8) {
  console.error('Foydalanish: npm run hash -- "kamida-8-belgili-parol"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
// `$` belgilari .env da o'zgaruvchi deb o'qilmasligi uchun ekranlanadi.
console.log(`ADMIN_PASSWORD_HASH="${hash.replace(/\$/g, "\\$")}"`);

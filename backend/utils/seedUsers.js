const User = require("../models/User");
const demoUsers = require("../data/demoUsers");
const { hashPassword } = require("./password");

async function seedUsers() {
  for (const u of demoUsers) {
    await User.findOneAndUpdate(
      { phone: u.phone },
      {
        phone: u.phone,
        passwordHash: hashPassword(u.password),
        name: u.name,
        role: u.role,
        providerHost: u.providerHost || undefined,
        email: u.email || undefined,
        age: u.age ?? undefined,
        interestType: u.interestType || undefined,
        profileCompleted: u.profileCompleted === true,
        active: true,
      },
      { upsert: true, returnDocument: "after" }
    );
  }
  console.log(`✓ تم تهيئة ${demoUsers.length} حسابات تجريبية`);
  return { count: demoUsers.length };
}

module.exports = { seedUsers };

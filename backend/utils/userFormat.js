const ROLE_LABELS = {
  visitor: "زائر",
  provider: "مقدم تجربة",
  admin: "مدير المنصة",
};

const INTEREST_LABELS = {
  adventure: "محب المغامرات",
  exploration: "محب الاستكشاف",
  both: "المغامرة والاستكشاف",
};

function formatUser(user) {
  if (!user) return null;
  return {
    id: String(user._id || user.id),
    name: user.name,
    phone: user.phone,
    email: user.email || undefined,
    age: user.age != null ? user.age : undefined,
    role: user.role,
    roleLabel: ROLE_LABELS[user.role] || user.role,
    providerHost: user.providerHost || undefined,
    interestType: user.interestType || undefined,
    interestLabel: user.interestType ? INTEREST_LABELS[user.interestType] : undefined,
    profileCompleted: user.profileCompleted === true,
  };
}

module.exports = { formatUser, ROLE_LABELS, INTEREST_LABELS };

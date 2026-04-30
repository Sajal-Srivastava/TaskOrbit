const jwt = require('jsonwebtoken');

const signToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  );

module.exports = {
  signToken,
};

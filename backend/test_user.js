const bcrypt = require('bcryptjs');

async function test() {
  const match = await bcrypt.compare('admin123', '$2a$10$LPMj6jXrRHiS84J4Lp/pbeIoR.VR9ajx/Ztx6ZJcKme2Q34wYzEAa');
  console.log('PASSWORD MATCHES admin123:', match);
}

test();

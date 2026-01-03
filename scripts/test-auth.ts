
import { verifyPassword, hashPassword } from "../packages/auth/src/password";

async function test() {
  const password = "password123";
  const hash = await hashPassword(password);
  console.log("Generated Hash:", hash);
  
  const isValid = await verifyPassword(password, hash);
  console.log("Is Valid:", isValid);
  
  const providedHash = "$2a$10$cchOSncBrntu/uvx2i7uve9r8SVN1DimSz/y.IcFArHemi5.5oC/K";
  const isProvidedValid = await verifyPassword(password, providedHash);
  console.log("Is Provided Hash Valid:", isProvidedValid);
}

test().catch(console.error);

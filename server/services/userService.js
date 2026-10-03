import bcrypt from "bcrypt";
import { createUser } from "../models/userModel.js";

export const registerUser = async ({
  name,
  email,
  password,
  phone,
}) => {
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await createUser({
    name,
    email,
    passwordHash,
    phone,
  });

  return user;
};
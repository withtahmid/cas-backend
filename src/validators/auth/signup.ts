import { emailSchema, nameSchema, passwordSchema, usernameSchema } from "../zod";
import { z } from "zod";
export const signupFormSchema = z
.object({
  username: usernameSchema,
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: passwordSchema
});
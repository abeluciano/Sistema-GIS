import { z } from "zod";

export const adminLoginSchema = z.object({
  body: z.object({
    usuario: z.string().min(1),
    password: z.string().min(1)
  })
});

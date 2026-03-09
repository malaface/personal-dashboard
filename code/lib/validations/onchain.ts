import { z } from "zod"

export const OnchainWalletSchema = z.object({
  address: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Dirección Ethereum inválida"),
  label: z
    .string()
    .min(1, "El nombre es requerido")
    .max(50, "Máximo 50 caracteres"),
  network: z.enum(["ARBITRUM", "ETHEREUM"]).default("ARBITRUM"),
})

export const OnchainSyncSchema = z.object({
  walletId: z.string().cuid("ID de wallet inválido"),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
})

export const CovalentKeySchema = z.object({
  apiKey: z
    .string()
    .min(20, "La API key debe tener al menos 20 caracteres"),
})

export type OnchainWalletInput = z.infer<typeof OnchainWalletSchema>
export type OnchainSyncInput = z.infer<typeof OnchainSyncSchema>
export type CovalentKeyInput = z.infer<typeof CovalentKeySchema>

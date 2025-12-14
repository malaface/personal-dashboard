import { z } from "zod"

export const FoodItemSchema = z.object({
  name: z.string().min(2, "Food name is required").max(100),
  quantity: z.number().positive("Quantity must be positive"),
  unit: z.string().min(1, "Unit is required").max(20),
  calories: z.number().int().min(0).optional(),
  protein: z.number().min(0).optional(),
  carbs: z.number().min(0).optional(),
  fats: z.number().min(0).optional(),
})

export const MealSchema = z.object({
  name: z.string().min(2, "Meal name is required").max(100),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
  date: z.string().or(z.date()),
  notes: z.string().max(300).optional(),
})

export const MealWithFoodItemsSchema = MealSchema.extend({
  foodItems: z.array(FoodItemSchema).min(1, "Add at least one food item"),
})

export type FoodItemInput = z.infer<typeof FoodItemSchema>
export type MealInput = z.infer<typeof MealSchema>
export type MealWithFoodItemsInput = z.infer<typeof MealWithFoodItemsSchema>

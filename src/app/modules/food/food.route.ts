import express from 'express'
import { FoodController } from './food.controller'
const router = express.Router()
router.get('/foods', FoodController.getFoods),
  router.get('/food/:id', FoodController.deleteFood),
  router.post('/food/:id', FoodController.updateFood)
router.post('/food/:id', FoodController.deleteFood)
router.post('/create-food', FoodController.createFood)
export const FoodRoute = router

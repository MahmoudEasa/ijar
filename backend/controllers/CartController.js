import Cart from '../models/CartSchema';
import User from '../models/UserSchema';
import Car from '../models/CarSchema';

const getAllCart = async (req, res) => {
  try {
    const userId = req.userId;
    const carts = await Cart.find({ userId });
  
    const newCart = carts.map((car) => {
      const { _id, ...rest } = car._doc;
      return { id: _id, ...rest };
    });
    return (newCart)
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

class CartController {
  static async addToCart(req, res) {
    try {
      const data = {
        userId: req.body.userId,
        carId: req.body.carId,
        rentalTerm: req.body.rentalTerm || 1,
        totalCost: req.body.totalCost,
      };

      const date = new Date();
      date.setHours(date.getHours() + (data.rentalTerm * 24));
  
      data.endDate = date;
      data.totalCost = data.rentalTerm * data.totalCost;
      const cart = new Cart(data);
      await cart.save();
      const { _id, ...rest } = cart._doc;
      return res.status(200).json({ id: _id, ...rest });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getCart(req, res) {
    try {
      const newCarts = await getAllCart(req, res);
      return res.status(200).send(newCarts);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async deleteFromCart(req, res) {
    try {
      const cartId = req.params.id;
      const userId = req.userId;
      const cart = await Cart.findOne({
        _id: cartId,
        userId,
      });

      if (!cart) {
        return res.status(401).send({ error: 'Not found' });
      }

      await Cart.findByIdAndDelete(cart._id);
      return res.status(200).send({ message: "Deleted successfully" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async checkout(req, res) {
    try {
      const newCarts = await getAllCart(req, res);
      console.log(newCarts);
      const result = {
        messages: [],
        errors: []
      };

      newCarts.map(async (c) => {
        const carId = c.carId;
        const car = await Car.findOne({ _id: carId });
        console.log(car);
        if (car) {
          if (car.available) {
            car.available = false;
            car.save();
            result.messages.push(`${car.brandName} Booked Successfully`);
          } else {
            await Cart.findByIdAndDelete(c.id);
            result.errors.push(`${car.brandName} is not available`);
          }
        } else {
          await Cart.findByIdAndDelete(c.id);
          result.errors.push(`Not found`);
        }
      });
      
      return res.status(200).send(result);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default CartController;
import { Request, Response } from "express";
import AppDataSource from "../db/db";
import { Product } from "../model/product";

const productRepository = AppDataSource.getRepository(Product);

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = await productRepository.create(req.body);

    if (!product) {
      res.status(500).json({
        success: false,
        message: "something went wrong",
      });
      return;
    }

    await productRepository.save(product);

    res.status(201).json({
      success: true,
      message: "product created successfully",
      product,
    });
  } catch (error) {
    console.log(error);
  }
};

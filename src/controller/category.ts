import { Request, Response } from "express";
import AppDataSource from "../db/db";

import { Category } from "../model/category";

const categoryRepository = AppDataSource.getRepository(Category);

export const createCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoryRepository.create(req.body);

    if (!category) {
      res.status(500).json({
        success: false,
        message: "something went wrong",
      });
      return;
    }

    await categoryRepository.save(category);

    res.status(201).json({
      success: true,
      message: "category created successfully",
      category,
    });
  } catch (error) {
    console.log(error);
  }
};

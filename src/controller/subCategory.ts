import { Request, Response } from "express";
import AppDataSource from "../db/db";
import { subCategory } from "../model/subCategory";

const subCategoryRepository = AppDataSource.getRepository(subCategory);

export const createSubcategory = async (req: Request, res: Response) => {
  try {
    const subcategory = await subCategoryRepository.create(req.body);

    if (!subcategory) {
      res.status(500).json({
        success: false,
        message: "something went wrong",
      });
      return;
    }

    await subCategoryRepository.save(subcategory);

    res.status(201).json({
      success: true,
      message: "subcategory created successfully",
      subcategory,
    });
  } catch (error) {
    console.log(error);
  }
};

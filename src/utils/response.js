export const successResponse = (res, { message, data }) => {
  return res.status(200).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (res, { message, error, status = 500 }) => {
  return res.status(status).json({
    success: false,
    message,
    error,
  });
};


export const createChecklist = async (req, res, next) => {
  try {
    const result = await checklistService.insertChecklist(req.body);

    res.status(201).json({
      success: true,
      message: "Checklist task created",
      data: result
    });
  } catch (err) {
    next(err);
  }
};

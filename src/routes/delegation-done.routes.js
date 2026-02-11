
// import express from "express";
// import {
//   getDelegationDone
// } from "../controllers/delegation-done.controller.js";

// const router = express.Router();


// router.get("/", getDelegationDone);



// export default router;


import express from "express";
import {
  getDelegationDone,
  updateDelegationDone
} from "../controllers/delegation-done.controller.js";

const router = express.Router();

// GET
router.get("/", getDelegationDone);

// UPDATE
// router.put("/:id", updateDelegationDone);
router.put("/task/:id", updateDelegationDone);



export default router;

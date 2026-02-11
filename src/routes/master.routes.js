import express from 'express';
import {
  createMaster,
  getMasterData,
  updateMaster,
  deleteMaster
} from '../controllers/master.controller.js';

const router = express.Router();

router.post('/', createMaster);
router.get('/', getMasterData);
router.put('/:id', updateMaster);
router.delete('/:id', deleteMaster);

export default router;
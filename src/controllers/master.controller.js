import { 
  createMasterService, 
  getMasterDataService, 
  updateMasterService, 
  deleteMasterService 
} from '../services/master.service.js';

export const createMaster = async (req, res) => {
  try {
    const { department, given_by } = req.body;
    const result = await createMasterService(department, given_by);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMasterData = async (req, res) => {
  try {
    const data = await getMasterDataService();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMaster = async (req, res) => {
  try {
    const { id } = req.params;
    const { department, given_by } = req.body;
    const result = await updateMasterService(id, department, given_by);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteMaster = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deleteMasterService(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
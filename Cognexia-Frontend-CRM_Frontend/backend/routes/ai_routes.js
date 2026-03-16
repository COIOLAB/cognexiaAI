import express from "express";
import { createERPChain } from "../ai/langchain_agent.js";

const router = express.Router();
const erpChain = createERPChain();

router.post("/run", async (req, res) => {
  const { instruction } = req.body;
  if (!instruction) return res.status(400).json({ error: "Instruction required" });

  try {
    const code = await erpChain.call({ instruction });
    res.json({ code });
  } catch (err) {
    console.error("AI generation error:", err);
    res.status(500).json({ error: "AI generation failed" });
  }
});

export default router;

interface ClassScoreNode extends EnhancementStage {
  id: number;
  detail?: string; // don't know if this can be guaranteed yet
  next: Array<number>;
}

interface ClassScore extends EntityBase {
  classes: ServantClass[];
  nodes: Record<number, ClassScoreNode>;
  startNodes: Array<number>;
}

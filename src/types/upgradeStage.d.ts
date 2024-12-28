interface UpgradeStage {
  qp: number;
  /**
   * Array of Tuples containing item IDs with the amount needed
   */
  items: Array<[number, number]>;
}

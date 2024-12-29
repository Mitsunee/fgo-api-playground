interface Item extends EntityBase {
  rarity: "bronze" | "silver" | "gold";
  /**
   * Sorting priority, items should be listed from smallest to largest number
   */
  priority: number;
}

interface Item {
  id: number;
  name: string;
  rarity: "bronze" | "silver" | "gold";
  /**
   * Sorting priority, items should be listed from smallest to largest number
   */
  priority: number;
}

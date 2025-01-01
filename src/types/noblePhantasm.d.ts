interface ServantNP extends Omit<EntityBase, "en">, SkillUpgrade {
  card: CardType;
  detail: string;
  owner: number;
}

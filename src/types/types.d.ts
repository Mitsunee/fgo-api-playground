type ID = number | `${number}`;
type SupportedRegion = "EN" | "JP";
type CardType = "buster" | "arts" | "quick";
type FaceCardType = CardType | "extra";

interface EntityBase {
  id: number;
  name: string;
  /**
   * Set to true if available on EN Server
   */
  en?: true;
}
